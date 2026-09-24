/**
 * P3-04/P3-06 공용 RPC provider. AlleyStampRegistry에 대한 읽기 전용 접근과 이벤트
 * 조회를 감싼다. 서명/트랜잭션 발신은 하지 않는다 (claim 제출은 사용자 지갑이 직접 한다,
 * 03-onchain-system.md 4절: "초기에는 사용자가 테스트 가스를 부담하는 직접 제출 방식").
 */
import { createPublicClient, http, type Address, type Hex, type PublicClient } from "viem";

export interface ChainDeploymentConfig {
  rpcUrl: string;
  chainId: number;
  contractAddress: Address;
  deploymentBlockNumber: bigint;
  abi: readonly unknown[];
}

export class RpcUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("RPC_UNAVAILABLE: 체인 RPC에 연결할 수 없다. 새 승인 발급을 보류해야 한다.");
    this.name = "RpcUnavailableError";
    this.cause = cause;
  }
}

export interface StampClaimedLog {
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: bigint;
  blockNumber: bigint;
  blockHash: Hex;
  transactionHash: Hex;
  logIndex: number;
  removed: boolean;
}

/**
 * authorizationService/statusService/controller가 의존하는 좁은 읽기 인터페이스.
 * 테스트에서는 실제 RPC 없이 이 인터페이스의 fake 구현을 주입한다.
 */
export interface ChainReader {
  readonly contractAddress: Address;
  readonly chainId: number;
  hasStamp(recipient: Address, campaignId: Hex, spotId: Hex): Promise<boolean>;
}

export class ChainRpcProvider implements ChainReader {
  #client: PublicClient;
  #config: ChainDeploymentConfig;

  constructor(config: ChainDeploymentConfig) {
    this.#config = config;
    this.#client = createPublicClient({ transport: http(config.rpcUrl) });
  }

  get contractAddress(): Address {
    return this.#config.contractAddress;
  }

  get chainId(): number {
    return this.#config.chainId;
  }

  get deploymentBlockNumber(): bigint {
    return this.#config.deploymentBlockNumber;
  }

  async assertChainId(): Promise<void> {
    try {
      const liveChainId = await this.#client.getChainId();
      if (liveChainId !== this.#config.chainId) {
        throw new Error(
          `설정된 chainId(${this.#config.chainId})와 RPC의 실제 chainId(${liveChainId})가 다르다`,
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("실제 chainId")) throw err;
      throw new RpcUnavailableError(err);
    }
  }

  async getLatestBlockNumber(): Promise<bigint> {
    try {
      return await this.#client.getBlockNumber();
    } catch (err) {
      throw new RpcUnavailableError(err);
    }
  }

  async getBlock(blockNumber: bigint): Promise<{ hash: Hex; timestamp: bigint }> {
    try {
      const block = await this.#client.getBlock({ blockNumber });
      return { hash: block.hash, timestamp: block.timestamp };
    } catch (err) {
      throw new RpcUnavailableError(err);
    }
  }

  async hasStamp(recipient: Address, campaignId: Hex, spotId: Hex): Promise<boolean> {
    try {
      return (await this.#client.readContract({
        address: this.#config.contractAddress,
        abi: this.#config.abi,
        functionName: "hasStamp",
        args: [recipient, campaignId, spotId],
      })) as boolean;
    } catch (err) {
      throw new RpcUnavailableError(err);
    }
  }

  /**
   * P3-06 인덱서가 사용하는 StampClaimed 이벤트 조회. fromBlock/toBlock 범위는 호출자가
   * 제한한다 (03-onchain-system.md 6절: "RPC 요청 블록 범위를 제한한다").
   */
  async getStampClaimedLogs(fromBlock: bigint, toBlock: bigint): Promise<StampClaimedLog[]> {
    try {
      const logs = await this.#client.getContractEvents({
        address: this.#config.contractAddress,
        abi: this.#config.abi,
        eventName: "StampClaimed",
        fromBlock,
        toBlock,
        strict: true,
      });
      return logs.map((log: any) => ({
        recipient: log.args.recipient,
        campaignId: log.args.campaignId,
        spotId: log.args.spotId,
        nonce: log.args.nonce,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        removed: Boolean(log.removed),
      }));
    } catch (err) {
      throw new RpcUnavailableError(err);
    }
  }
}
