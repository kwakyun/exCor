# Git & GitHub 표준 운영 절차 (Git Workflow)

이 문서는 5인 개발팀과 AI Agent가 코드베이스를 안전하게 유지하기 위한 Git 브랜치 전략, 커밋 컨벤션, 동기화 및 충돌 해결 규칙을 다룹니다.

---

## 1. 브랜치 전략

- **`main`**: 항상 배포 가능한 안정 상태의 단일 원천 브랜치
  - 직접 push 및 직접 merge 절대 금지
  - 오직 승인된 PR을 통한 `Squash and merge`로만 반영

### 브랜치 네이밍 규칙
```text
<type>/<issue-number>-<short-description>
```

- `feature/42-email-signup`
- `fix/57-payment-timeout`
- `hotfix/88-security-patch`
- `refactor/63-api-error-handler`
- `docs/12-local-setup-guide`
- `test/77-integration-tests`
- `chore/71-upgrade-dependencies`
- `agent/103-profile-update-api`

### 핵심 원칙
- **1 Issue = 1 Branch = 1 PR**
- 병합된 브랜치는 즉시 삭제하며, 재사용하지 않음
- 하나의 브랜치에 복수의 Agent 또는 작업자가 동시 작업하지 않음

---

## 2. Conventional Commits 규칙

```text
<type>(<scope>): <summary>
```

- 허용 Type: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `ci`, `perf`, `revert`
- 커밋 메시지는 논리적 작업 단위별로 분리
- 모호한 메시지(`fix`, `update`, `working`) 금지
- 기능 변경 커밋에는 관련 테스트 코드가 동반되어야 함

---

## 3. 동기화 및 검증 규칙

### 작업 시작 시
```bash
git switch main
git pull --ff-only origin main
git switch -c feature/<issue-number>-<short-description>
```

### 작업 도중
- 코딩 도중 무분별한 `git pull` 자제
- 공통 의존성, 모듈 인터페이스 변경이 main에 반영된 경우에만 rebase 검토

### PR 생성 직전 (필수)
```bash
git fetch origin
git rebase origin/main

# 프로젝트 검증 실행
npm run lint
npm run typecheck
npm test
npm run build
```

---

## 4. 충돌 발생 시 5단계 에스컬레이션

1. 충돌 파일 목록 식별
2. `main`에 병합된 선행 변경의 목적 파악
3. 현재 브랜치 기능과의 충돌성 분석
4. **100% 안전이 보장될 때만** 충돌 코드 정리
5. **조금이라도 불확실한 경우 임의 수정 금지 → 사람에게 아래 양식으로 보고**:
   - 충돌 파일 목록
   - main 변경 목적 vs 현재 브랜치 변경 목적
   - 기능 / 데이터 / 보안 위험
   - 권장 해결안 및 선택지
