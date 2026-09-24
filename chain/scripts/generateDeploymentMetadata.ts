// P3-02: 로컬 배포 후 UI/API가 공급받을 단일 metadata 파일을 생성한다.
// "각 모듈에 계약 주소를 수동 중복 입력하지 않는다" (03-onchain-system.md 7절)는 원칙에
// 따라 이 스크립트가 컴파일 산출물(artifact)에서 ABI를 그대로 읽어 옮긴다.
//
// 사용법: npm run deploy:local 로 Ignition 배포를 마친 뒤,
//   npx tsx scripts/generateDeploymentMetadata.ts <chainId> <address> <deploymentBlock>
// 을 실행한다. 값은 실행 시 Ignition/노드 출력에서 그대로 옮겨 적어야 하며 이 스크립트가
// 추정하지 않는다.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function main() {
  const [, , chainIdArg, addressArg, blockArg] = process.argv;
  if (!chainIdArg || !addressArg || !blockArg) {
    console.error(
      "usage: tsx scripts/generateDeploymentMetadata.ts <chainId> <address> <deploymentBlockNumber>",
    );
    process.exitCode = 1;
    return;
  }

  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "AlleyStampRegistry.sol",
    "AlleyStampRegistry.json",
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
  const packageJson = JSON.parse(
    readFileSync(path.join(__dirname, "..", "package.json"), "utf-8"),
  );

  const metadata = {
    _comment:
      "P3-02 로컬 배포 metadata. 이 파일이 계약 주소/ABI의 단일 출처이며 다른 모듈에 " +
      "주소를 수동 복사하지 않는다. 공개 테스트넷/운영 배포 metadata가 아니다.",
    network: "hardhat-localhost",
    chainId: Number(chainIdArg),
    contractName: "AlleyStampRegistry",
    address: addressArg,
    deploymentBlockNumber: Number(blockArg),
    eip712Domain: {
      name: "BusanAlleyStamp",
      version: "1",
    },
    contractPackageVersion: packageJson.version,
    abiVersion: `AlleyStampRegistry@${packageJson.version}+eip712v1`,
    generatedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const outDir = path.join(__dirname, "..", "deployments");
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `local-${chainIdArg}.json`);
  writeFileSync(outPath, JSON.stringify(metadata, null, 2) + "\n", "utf-8");
  console.log(`written: ${outPath}`);
}

main();
