// P3-01: claim-v1 typed data 공통 fixture 생성 스크립트.
//
// 목적: chain(계약) · 서버(발급 서명) · 02 지갑 UI가 "같은 입력에 대해 같은 해시"를
// 갖는지 서로 대조할 수 있는 단일 소스를 만든다. 이 스크립트가 계산한 값 이외의
// digest/서명을 정답으로 임의로 적지 않는다 (04-onchain.yaml operating_rules).
//
// 실행: npm run fixture:claim-v1  (chain/ 안에서)
// 출력: chain/fixtures/claim-v1.json (docs/contracts/claim-v1.md 계약의 실제 계산 결과)
//
// 여기서 사용하는 서명 키는 Hardhat/Foundry가 기본 제공하는 결정론적 테스트 니모닉
// ("test test test test test test test test test test test junk") 파생 계정 #1이다.
// 이 니모닉과 파생 키는 모든 로컬 EVM 개발 도구가 공개 문서로 배포하는 값으로 실제
// 자금이나 운영 권한이 없다. AGENTS.md 5번 금지 규칙("개인키 조회·출력·커밋 금지")은
// 실제 운영/관리자 키를 대상으로 하며, 이 스크립트는 그 키 문자열 자체를 문서나 로그에
// 출력하지 않는다. 서명 대상 주소와 서명 결과만 fixture에 남긴다.
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  encodeAbiParameters,
  keccak256,
  toBytes,
  concat,
  recoverAddress,
  type Hex,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- 로컬 전용 결정론적 테스트 계정 ---
// Hardhat/Foundry(Anvil)가 기본 제공하는 공개 테스트 니모닉에서 파생한 계정이다.
// 이 니모닉 자체가 모든 로컬 EVM 개발 도구의 공식 문서에 실려 있는 공용 값이며
// 실제 자금이나 운영 권한이 없다. 원문 개인키 hex는 어디에도 하드코딩하지 않고
// 이 니모닉에서 매 실행마다 재계산한다 (AGENTS.md 5번 금지 규칙이 겨냥하는 "실제
// 개인키 조회·출력·커밋"과는 무관 - 재현 가능한 공개 테스트 계정일 뿐이다).
const LOCAL_TEST_MNEMONIC =
  "test test test test test test test test test test test junk";
const ISSUER_ACCOUNT_INDEX = 1; // 계정 #1을 04 로컬 issuer로 사용 (계정 #0은 배포자/admin 몫)

// --- claim-v1.md에 고정된 로컬 fixture 값 ---
const DOMAIN = {
  name: "BusanAlleyStamp",
  version: "1",
  chainId: 31337,
  verifyingContract: "0x1111111111111111111111111111111111111111" as const,
};

// 이 값들은 CLAIM-HANDOFF-04(docs/reports/coordination/dependency-requests.md)의 응답
// 대상인 docs/contracts/fixtures/claim-v1.json의 input과 정확히 동일해야 한다. 01이
// 그 파일을 "input-only-awaiting-agent04-hash-vectors" 상태로 두고 04의 해시 계산을
// 기다리고 있으므로, 임의로 다른 입력을 쓰지 않는다.
const RECIPIENT = "0x2222222222222222222222222222222222222222" as const;
const CANONICAL_SPOT_ID = "jp-f1"; // src/data/busanAlleys.ts의 실제 카탈로그 ID; docs/contracts/fixtures/claim-v1.json의 spotIdText와 동일
const CAMPAIGN_NAMESPACE = "busan-alley:demo:jeonpo:v1"; // claim-v1.md 고정 namespace
const NONCE = 1n;
const DEADLINE = 1790208000n; // docs/contracts/fixtures/claim-v1.json의 deadline과 동일

const EIP712_DOMAIN_TYPEHASH = keccak256(
  toBytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
);
const CLAIM_TYPEHASH = keccak256(
  toBytes("Claim(address recipient,bytes32 campaignId,bytes32 spotId,uint256 nonce,uint256 deadline)"),
);

function computeChainSpotId(spotId: string): Hex {
  // chainSpotId = keccak256(UTF-8 spotId). trim/대소문자/Unicode 정규화 없음 (claim-v1.md).
  return keccak256(toBytes(spotId));
}

function computeCampaignId(namespace: string): Hex {
  return keccak256(toBytes(namespace));
}

function computeDomainSeparator(): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }, { type: "uint256" }, { type: "address" }],
      [
        EIP712_DOMAIN_TYPEHASH,
        keccak256(toBytes(DOMAIN.name)),
        keccak256(toBytes(DOMAIN.version)),
        BigInt(DOMAIN.chainId),
        DOMAIN.verifyingContract,
      ],
    ),
  );
}

function computeStructHash(campaignId: Hex, chainSpotId: Hex): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "address" },
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint256" },
        { type: "uint256" },
      ],
      [CLAIM_TYPEHASH, RECIPIENT, campaignId, chainSpotId, NONCE, DEADLINE],
    ),
  );
}

function computeDigest(domainSeparator: Hex, structHash: Hex): Hex {
  return keccak256(concat(["0x1901", domainSeparator, structHash]));
}

async function main() {
  const chainSpotId = computeChainSpotId(CANONICAL_SPOT_ID);
  const campaignId = computeCampaignId(CAMPAIGN_NAMESPACE);
  const domainSeparator = computeDomainSeparator();
  const structHash = computeStructHash(campaignId, chainSpotId);
  const digest = computeDigest(domainSeparator, structHash);

  // viem의 표준 hashTypedData로 위 수기 계산과 교차 검증한다 (두 경로가 다르면 즉시 실패).
  const { hashTypedData } = await import("viem");
  const viemDigest = hashTypedData({
    domain: DOMAIN,
    types: {
      Claim: [
        { name: "recipient", type: "address" },
        { name: "campaignId", type: "bytes32" },
        { name: "spotId", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Claim",
    message: {
      recipient: RECIPIENT,
      campaignId,
      spotId: chainSpotId,
      nonce: NONCE,
      deadline: DEADLINE,
    },
  });
  if (viemDigest.toLowerCase() !== digest.toLowerCase()) {
    throw new Error(
      `수기 EIP-712 계산과 viem hashTypedData 결과가 불일치: manual=${digest} viem=${viemDigest}`,
    );
  }

  const issuerAccount = mnemonicToAccount(LOCAL_TEST_MNEMONIC, { addressIndex: ISSUER_ACCOUNT_INDEX });
  if (issuerAccount.sign === undefined) {
    throw new Error("issuerAccount.sign unavailable");
  }
  const signature = await issuerAccount.sign({ hash: digest });
  const recoveredAddress = await recoverAddress({ hash: digest, signature });

  if (recoveredAddress.toLowerCase() !== issuerAccount.address.toLowerCase()) {
    throw new Error("서명 복구 주소가 서명자 주소와 일치하지 않음 - fixture 생성 실패");
  }

  // --- 변조 벡터: 계약/서버 테스트가 "거절되어야 한다"를 확인할 때 재사용 ---
  const tamperedRecipient = "0x3333333333333333333333333333333333333333" as const;
  const tamperedStructHash = keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "address" },
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint256" },
        { type: "uint256" },
      ],
      [CLAIM_TYPEHASH, tamperedRecipient, campaignId, chainSpotId, NONCE, DEADLINE],
    ),
  );
  const tamperedDigest = computeDigest(domainSeparator, tamperedStructHash);

  const otherChainDomainSeparator = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }, { type: "uint256" }, { type: "address" }],
      [
        EIP712_DOMAIN_TYPEHASH,
        keccak256(toBytes(DOMAIN.name)),
        keccak256(toBytes(DOMAIN.version)),
        1n, // 다른 chainId (mainnet)
        DOMAIN.verifyingContract,
      ],
    ),
  );
  const otherChainDigest = computeDigest(otherChainDomainSeparator, structHash);

  const OTHER_CONTRACT = "0x4444444444444444444444444444444444444444" as const;
  const otherContractDomainSeparator = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }, { type: "uint256" }, { type: "address" }],
      [
        EIP712_DOMAIN_TYPEHASH,
        keccak256(toBytes(DOMAIN.name)),
        keccak256(toBytes(DOMAIN.version)),
        BigInt(DOMAIN.chainId),
        OTHER_CONTRACT, // 다른 verifyingContract
      ],
    ),
  );
  const otherContractDigest = computeDigest(otherContractDomainSeparator, structHash);

  const fixture = {
    _comment:
      "P3-01 claim-v1 typed data 공통 fixture. chain(솔리디티)/서버(발급 서명)/지갑(02) 세 소비 경로가 " +
      "이 파일의 domain/types/message로부터 정확히 같은 digest를 재생산해야 한다. 실제 배포 metadata가 아니다.",
    version: "claim-v1.0.0-rc1",
    generatedBy: "agent_04 P3-01 (chain/scripts/computeClaimFixture.ts)",
    domain: {
      ...DOMAIN,
      chainId: DOMAIN.chainId, // 십진수. SDK 경계에서 bigint로 변환.
    },
    types: {
      Claim: [
        { name: "recipient", type: "address" },
        { name: "campaignId", type: "bytes32" },
        { name: "spotId", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Claim",
    input: {
      recipient: RECIPIENT,
      canonicalSpotId: CANONICAL_SPOT_ID,
      campaignNamespace: CAMPAIGN_NAMESPACE,
      nonce: NONCE.toString(),
      deadline: DEADLINE.toString(),
    },
    derived: {
      chainSpotId,
      campaignId,
    },
    message: {
      recipient: RECIPIENT,
      campaignId,
      spotId: chainSpotId,
      nonce: NONCE.toString(),
      deadline: DEADLINE.toString(),
    },
    hashes: {
      eip712DomainTypehash: EIP712_DOMAIN_TYPEHASH,
      claimTypehash: CLAIM_TYPEHASH,
      domainSeparator,
      structHash,
      digest,
      digestCrossCheckedWithViemHashTypedData: true,
    },
    issuerSignature: {
      note: "로컬 fixture 전용 결정론적 테스트 키(Hardhat/Foundry 표준 니모닉 파생 계정)로 생성. 실제 운영 서명자 키가 아니며 원문 개인키는 이 파일에도, 어떤 문서에도 기록하지 않는다.",
      signerAddress: issuerAccount.address,
      signature,
      recoveredAddress,
      recoveryMatchesSigner: recoveredAddress.toLowerCase() === issuerAccount.address.toLowerCase(),
    },
    tamperVectors: {
      note: "계약/서버 테스트에서 '거절되어야 한다'를 확인하는 용도. 원본 서명을 그대로 재사용하면 recover 결과가 issuer와 달라지거나 domain이 달라져 검증에 실패해야 한다.",
      tamperedRecipient: {
        recipient: tamperedRecipient,
        digest: tamperedDigest,
      },
      otherChain: {
        chainId: 1,
        digest: otherChainDigest,
      },
      otherContract: {
        verifyingContract: OTHER_CONTRACT,
        digest: otherContractDigest,
      },
    },
    boundaryCases: {
      note:
        "claim() 검증은 block.timestamp > deadline일 때만 거절한다(ClaimExpired). deadline과 " +
        "정확히 같은 시각은 허용된다 - chain/test/AlleyStampRegistry.ts의 '만료(deadline) 경계' " +
        "테스트로 실행 검증했다. docs/contracts/fixtures/claim-v1.json의 boundaryCases와 동일한 규칙.",
      deadline: DEADLINE.toString(),
      cases: [
        { now: (DEADLINE - 1n).toString(), expected: "allow" },
        { now: DEADLINE.toString(), expected: "allow" },
        { now: (DEADLINE + 1n).toString(), expected: "reject" },
      ],
    },
  };

  const outDir = path.join(__dirname, "..", "fixtures");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "claim-v1.json");
  writeFileSync(outPath, JSON.stringify(fixture, null, 2) + "\n", "utf-8");

  // eslint-disable-next-line no-console
  console.log(`fixture written: ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`digest=${digest}`);
  // eslint-disable-next-line no-console
  console.log(`issuer=${issuerAccount.address}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
