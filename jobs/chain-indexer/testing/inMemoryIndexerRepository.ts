/**
 * 테스트 전용 in-memory IndexerRepository. "메모리 fake는 영속성 통과 증거가 아니다"
 * (api-v1.md) - P3-DB(03)의 실제 PostgreSQL 구현이 accepted 되기 전까지 단위 테스트에만
 * 사용한다. 실제 구현은 chain_events/stamp_projections/indexer_cursors 세 테이블을
 * 하나의 DB transaction으로 묶어야 한다; 이 in-memory 버전은 단일 이벤트 루프에서
 * 동기적으로 Map을 갱신해 "원자성"을 근사할 뿐이다.
 */
import type { Address, Hex } from "viem";
import type {
  BlockRef,
  ChainEventInput,
  ChainEventRecord,
  IndexerCursor,
  IndexerRepository,
  StampProjectionRecord,
} from "../ports.js";

const RECENT_BLOCK_WINDOW = 256;

function key(chainId: number, contractAddress: Address): string {
  return `${chainId}:${contractAddress.toLowerCase()}`;
}

function eventKey(chainId: number, contractAddress: Address, txHash: Hex, logIndex: number): string {
  return `${key(chainId, contractAddress)}:${txHash}:${logIndex}`;
}

function projectionKey(
  chainId: number,
  contractAddress: Address,
  recipient: Address,
  campaignId: Hex,
  spotId: Hex,
): string {
  return `${key(chainId, contractAddress)}:${recipient.toLowerCase()}:${campaignId}:${spotId}`;
}

export class InMemoryIndexerRepository implements IndexerRepository {
  #cursors = new Map<string, IndexerCursor>();
  #recentBlocks = new Map<string, BlockRef[]>(); // 최신이 인덱스 0
  #events = new Map<string, ChainEventRecord>();
  #projections = new Map<string, StampProjectionRecord>();

  async getCursor(chainId: number, contractAddress: Address): Promise<IndexerCursor | null> {
    return this.#cursors.get(key(chainId, contractAddress)) ?? null;
  }

  async getRecentBlockHashes(chainId: number, contractAddress: Address): Promise<BlockRef[]> {
    return [...(this.#recentBlocks.get(key(chainId, contractAddress)) ?? [])];
  }

  async applyCanonicalBatch(input: {
    chainId: number;
    contractAddress: Address;
    events: ChainEventInput[];
    newCursor: IndexerCursor;
    processedBlocks: BlockRef[];
  }): Promise<void> {
    const k = key(input.chainId, input.contractAddress);

    // 1) 이벤트 upsert (재수집해도 중복 생성하지 않음 - UNIQUE(txHash,logIndex) 근사)
    for (const evt of input.events) {
      const ek = eventKey(input.chainId, input.contractAddress, evt.transactionHash, evt.logIndex);
      this.#events.set(ek, {
        ...evt,
        chainId: input.chainId,
        contractAddress: input.contractAddress,
        canonical: true,
      });

      // 2) projection 갱신 - recipient+campaign+spot당 최신 canonical claim 기록
      const pk = projectionKey(input.chainId, input.contractAddress, evt.recipient, evt.campaignId, evt.spotId);
      this.#projections.set(pk, {
        chainId: input.chainId,
        contractAddress: input.contractAddress,
        recipient: evt.recipient,
        campaignId: evt.campaignId,
        spotId: evt.spotId,
        claimTransactionHash: evt.transactionHash,
        blockNumber: evt.blockNumber,
      });
    }

    // 3) 커서 전진
    this.#cursors.set(k, input.newCursor);

    // 4) 최근 블록해시 창 갱신 - 이번 배치가 처리한 구간의 모든 블록 해시를 누적한다
    //    (커서 tip 하나만 저장하면 다음 reorg에서 공통 조상을 찾을 수 없다).
    const window = this.#recentBlocks.get(k) ?? [];
    const processedNumbers = new Set(input.processedBlocks.map((b) => b.number));
    const withoutOverwritten = window.filter((b) => !processedNumbers.has(b.number));
    const updated = [...input.processedBlocks, ...withoutOverwritten]
      .sort((a, b) => (a.number > b.number ? -1 : 1))
      .slice(0, RECENT_BLOCK_WINDOW);
    this.#recentBlocks.set(k, updated);
  }

  async rollbackToBlock(
    chainId: number,
    contractAddress: Address,
    commonAncestor: BlockRef,
  ): Promise<void> {
    const k = key(chainId, contractAddress);

    // 공통 조상보다 큰 블록에서 생성된 이벤트를 canonical=false로 표시
    for (const [ek, evt] of this.#events) {
      if (
        evt.chainId === chainId &&
        evt.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
        evt.blockNumber > commonAncestor.number &&
        evt.canonical
      ) {
        this.#events.set(ek, { ...evt, canonical: false });
      }
    }

    // 무효화된 이벤트가 만든 projection을 재계산: 같은 recipient/campaign/spot에
    // 남아있는 가장 최근 canonical 이벤트로 대체하거나, 없으면 제거한다.
    const remainingByProjection = new Map<string, ChainEventRecord>();
    for (const evt of this.#events.values()) {
      if (
        evt.chainId !== chainId ||
        evt.contractAddress.toLowerCase() !== contractAddress.toLowerCase() ||
        !evt.canonical
      ) {
        continue;
      }
      const pk = projectionKey(chainId, contractAddress, evt.recipient, evt.campaignId, evt.spotId);
      const current = remainingByProjection.get(pk);
      if (!current || evt.blockNumber > current.blockNumber) {
        remainingByProjection.set(pk, evt);
      }
    }
    for (const [pk, projection] of [...this.#projections.entries()]) {
      if (
        projection.chainId !== chainId ||
        projection.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
      ) {
        continue;
      }
      const replacement = remainingByProjection.get(pk);
      if (replacement) {
        this.#projections.set(pk, {
          chainId,
          contractAddress,
          recipient: replacement.recipient,
          campaignId: replacement.campaignId,
          spotId: replacement.spotId,
          claimTransactionHash: replacement.transactionHash,
          blockNumber: replacement.blockNumber,
        });
      } else {
        this.#projections.delete(pk);
      }
    }

    this.#cursors.set(k, {
      chainId,
      contractAddress,
      processedBlockNumber: commonAncestor.number,
      processedBlockHash: commonAncestor.hash,
    });

    const window = this.#recentBlocks.get(k) ?? [];
    this.#recentBlocks.set(
      k,
      window.filter((b) => b.number <= commonAncestor.number),
    );
  }

  async getProjection(
    chainId: number,
    contractAddress: Address,
    recipient: Address,
    campaignId: Hex,
    spotId: Hex,
  ): Promise<StampProjectionRecord | null> {
    return this.#projections.get(projectionKey(chainId, contractAddress, recipient, campaignId, spotId)) ?? null;
  }

  async listCanonicalEvents(chainId: number, contractAddress: Address): Promise<ChainEventRecord[]> {
    return [...this.#events.values()].filter(
      (e) =>
        e.chainId === chainId &&
        e.contractAddress.toLowerCase() === contractAddress.toLowerCase() &&
        e.canonical,
    );
  }
}
