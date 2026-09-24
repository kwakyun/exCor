import type { Address, Hex } from "viem";
import type { IndexerChainReader } from "../ports.js";

export interface FakeStampEventInput {
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: bigint;
}

interface FakeBlock {
  number: bigint;
  hash: Hex;
  events: FakeStampEventInput[];
}

type StampClaimedLog = Awaited<ReturnType<IndexerChainReader["getStampClaimedLogs"]>>[number];

function fakeHash(blockNumber: bigint, epoch: number): Hex {
  return `0x${epoch.toString(16).padStart(4, "0")}${blockNumber.toString(16).padStart(60, "0")}` as Hex;
}

/**
 * 테스트 전용 in-memory 체인 시뮬레이터. reorg(afterBlockNumber)로 그 블록 이후를
 * 다른 내용(다른 해시/이벤트)으로 교체해 실제 재조직과 같은 상황을 만든다.
 */
export class FakeIndexerChain implements IndexerChainReader {
  #blocks: FakeBlock[] = [];
  #epoch = 0;
  #rpcDown = false;

  setRpcDown(down: boolean): void {
    this.#rpcDown = down;
  }

  mineBlock(events: FakeStampEventInput[] = []): bigint {
    const number = BigInt(this.#blocks.length + 1);
    this.#blocks.push({ number, hash: fakeHash(number, this.#epoch), events });
    return number;
  }

  /** afterBlockNumber(포함하지 않음) 이후 블록을 모두 제거하고 새 epoch로 다시 채굴한다. */
  reorgAfter(afterBlockNumber: bigint): void {
    this.#epoch += 1;
    this.#blocks = this.#blocks.filter((b) => b.number <= afterBlockNumber);
  }

  async getLatestBlockNumber(): Promise<bigint> {
    if (this.#rpcDown) throw new Error("fake RPC down");
    return BigInt(this.#blocks.length);
  }

  async getBlock(blockNumber: bigint): Promise<{ hash: Hex; timestamp: bigint }> {
    if (this.#rpcDown) throw new Error("fake RPC down");
    const block = this.#blocks.find((b) => b.number === blockNumber);
    if (!block) throw new Error(`fake chain: block ${blockNumber} not found`);
    return { hash: block.hash, timestamp: blockNumber };
  }

  async getStampClaimedLogs(fromBlock: bigint, toBlock: bigint): Promise<StampClaimedLog[]> {
    if (this.#rpcDown) throw new Error("fake RPC down");
    const result: StampClaimedLog[] = [];
    for (const block of this.#blocks) {
      if (block.number < fromBlock || block.number > toBlock) continue;
      block.events.forEach((evt, logIndex) => {
        result.push({
          recipient: evt.recipient,
          campaignId: evt.campaignId,
          spotId: evt.spotId,
          nonce: evt.nonce,
          blockNumber: block.number,
          blockHash: block.hash,
          transactionHash: `0x${block.number.toString(16).padStart(64, "0")}` as Hex,
          logIndex,
        });
      });
    }
    return result;
  }
}
