/**
 * P3-04 발급 서명자 provider.
 *
 * 원칙 (docs/architecture/implementation/03-onchain-system.md 2절,
 * AGENTS.md 5번 금지 규칙):
 *  - 개인키는 이 프로세스의 환경 변수 안에서만 존재하고 브라우저/로그/응답에 전달하지 않는다.
 *  - 이 모듈은 개인키 값을 조회하거나 반환하는 어떤 API도 노출하지 않는다. 서명 결과와
 *    서명자 주소만 밖으로 나간다.
 *  - 로그에는 서명 자체도 남기지 않는다 (api-v1.md: "서명은... API 로그에는 남기지 않는다").
 */
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import type { Address, Hex } from "viem";
import {
  buildClaimTypedData,
  type ClaimDomain,
  type ClaimMessage,
} from "./claimTypedData.js";

export interface IssuerSigner {
  getAddress(): Promise<Address>;
  signClaim(domain: ClaimDomain, message: ClaimMessage): Promise<Hex>;
}

export class ConfigMissingError extends Error {
  constructor(envVarName: string) {
    super(
      `발급 서명자 환경 변수 ${envVarName}가 설정되지 않았다. 운영 환경에서는 프로세스 비밀 ` +
        `설정(secret manager 등)으로만 주입해야 하며 코드/문서에 값을 적지 않는다.`,
    );
    this.name = "ConfigMissingError";
  }
}

/**
 * 환경 변수 `STAMP_ISSUER_PRIVATE_KEY`에서 issuer 개인키를 읽어 서명하는 구현체.
 * 이 클래스는 그 값을 절대 반환/로그하지 않는다.
 */
export class EnvIssuerSigner implements IssuerSigner {
  #account: PrivateKeyAccount;

  private constructor(account: PrivateKeyAccount) {
    this.#account = account;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): EnvIssuerSigner {
    const privateKey = env.STAMP_ISSUER_PRIVATE_KEY;
    if (!privateKey) {
      throw new ConfigMissingError("STAMP_ISSUER_PRIVATE_KEY");
    }
    return new EnvIssuerSigner(privateKeyToAccount(privateKey as Hex));
  }

  async getAddress(): Promise<Address> {
    return this.#account.address;
  }

  async signClaim(domain: ClaimDomain, message: ClaimMessage): Promise<Hex> {
    const typedData = buildClaimTypedData(domain, message);
    if (this.#account.signTypedData === undefined) {
      throw new Error("issuer account가 signTypedData를 지원하지 않는다");
    }
    return this.#account.signTypedData(typedData);
  }
}

/**
 * 테스트 전용 in-memory 서명자. 실제 운영에서 사용하지 않는다 - 04 write_scope의 단위
 * 테스트에서만 EnvIssuerSigner를 대체한다.
 */
export class InMemoryTestIssuerSigner implements IssuerSigner {
  #account: PrivateKeyAccount;

  constructor(privateKey: Hex) {
    this.#account = privateKeyToAccount(privateKey);
  }

  async getAddress(): Promise<Address> {
    return this.#account.address;
  }

  async signClaim(domain: ClaimDomain, message: ClaimMessage): Promise<Hex> {
    const typedData = buildClaimTypedData(domain, message);
    if (this.#account.signTypedData === undefined) {
      throw new Error("issuer account가 signTypedData를 지원하지 않는다");
    }
    return this.#account.signTypedData(typedData);
  }
}
