import type { Clock, NonceGenerator } from "./ports.js";
import { randomBytes } from "node:crypto";

export class SystemClock implements Clock {
  nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }
}

/** CSPRNG 기반 128비트 십진 nonce 생성기 (03-onchain-system.md 5절). */
export class CryptoNonceGenerator implements NonceGenerator {
  generate(): string {
    const bytes = randomBytes(16); // 128 bits - uint256 범위 내에서 안전하게 충돌 회피
    return BigInt(`0x${bytes.toString("hex")}`).toString(10);
  }
}
