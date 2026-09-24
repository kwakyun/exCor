import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";

// P3-02: chain 독립 패키지 설정. 루트 vite/vitest 설정과 완전히 분리한다.
// 공개 테스트넷 network는 이 실행 범위(로컬 개발/배포/검증)에 포함하지 않는다.
// 필요 시 별도 사람 승인 후 sepolia 등 network 블록을 추가한다.
export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
  },
});
