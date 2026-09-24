import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// P3-02: 로컬 Ignition 배포 모듈.
// admin 파라미터의 기본값은 Hardhat 로컬 네트워크의 계정 #0이다(테스트 목적).
// 공개 네트워크 배포 시에는 반드시 실제 운영 admin 주소를 파라미터로 전달해야 하며,
// 이 실행 범위(로컬 개발/배포/검증)에서는 공개 배포를 수행하지 않는다.
export default buildModule("AlleyStampRegistryModule", (m) => {
  const admin = m.getParameter(
    "admin",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat 로컬 계정 #0 (공개 문서화된 테스트 계정)
  );

  const registry = m.contract("AlleyStampRegistry", [admin]);

  return { registry };
});
