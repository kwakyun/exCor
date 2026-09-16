# Git & GitHub 협업 가이드 (CONTRIBUTING)

본 문서는 `exCor` 프로젝트의 브랜치 전략, 커밋 규칙, 동기화 및 충돌 해결 표준 절차를 규정합니다. 모든 개발자(사람)와 AI Agent는 이 규칙을 예외 없이 준수해야 합니다.

---

## 1. 브랜치 전략 (Branch Strategy)

- **기본 브랜치**: `main`
  - 항상 검증 가능하고 즉시 배포 가능한 공식 브랜치입니다.
  - **직접 push 절대 금지**, 오직 검증된 Pull Request를 통해서만 반영됩니다 (`Squash and merge`).

### 브랜치 접두사 및 명명 규칙
`접두사/<issue-number>-<short-description>` 형식으로 작성합니다:

| 접두사 | 용도 | 예시 |
|---|---|---|
| `feature/` | 신규 기능 개발 | `feature/42-email-signup` |
| `fix/` | 버그 수정 | `fix/57-payment-timeout` |
| `hotfix/` | 긴급 운영 장애 조치 | `hotfix/88-auth-session-leak` |
| `refactor/` | 코드 리팩터링 및 구조 개선 | `refactor/63-api-error-handler` |
| `docs/` | 문서 작성 및 수정 | `docs/12-local-setup-guide` |
| `test/` | 테스트 코드 추가/보강 | `test/77-cart-e2e-tests` |
| `chore/` | 의존성, 빌드 도구, 설정 변경 | `chore/71-upgrade-dependencies` |
| `agent/` | AI Agent 전용 자동화/작업 브랜치 | `agent/103-profile-update-api` |

### 브랜치 생명주기 규칙
1. **1 Issue = 1 Branch = 1 Pull Request**: 하나의 브랜치는 하나의 명확한 작업 목적만 갖습니다.
2. 병합 완료된 브랜치는 즉시 삭제합니다.
3. 병합된 브랜치를 후속 작업에 재사용하지 않습니다.
4. 여러 Agent 또는 여러 사람이 하나의 브랜치를 공동 수정하지 않습니다.
5. 핵심 파일 또는 공통 모듈 동시 변경이 예상되는 경우 병렬 작업을 제한합니다.

---

## 2. 커밋 규칙 (Conventional Commits)

### 형식
```text
<type>(<scope>): <summary>
```

### 허용 Type
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 기능 변화 없는 코드 구조 변경
- `test`: 테스트 코드 추가 및 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등 (비즈니스 로직 영향 없음)
- `chore`: 빌드 업무, 패키지 매니저 설정 등
- `ci`: CI 설정 및 스크립트 수정
- `perf`: 성능 향상을 위한 코드 변경
- `revert`: 이전 커밋 되돌리기

### 커밋 작성 수칙
- 커밋은 작고 논리적인 단위로 분리합니다.
- 무관한 변경 사항을 동일 커밋에 혼합하지 않습니다.
- `fix`, `update`, `working`, `final-final`과 같은 모호한 커밋 메시지는 엄격히 금지합니다.
- 테스트가 필요한 기능 변경에는 반드시 관련 테스트 커밋이 포함되어야 합니다.

---

## 3. Git 동기화 규칙 (Synchronization Workflow)

모든 사람과 AI Agent는 안전한 코드 동기화를 위해 다음 절차를 따릅니다.

### 1) 새 작업 시작 전
반드시 최신 `main`을 기준으로 작업 브랜치를 분기합니다:
```bash
git switch main
git pull --ff-only origin main
git switch -c feature/<issue-number>-<short-description>
# 또는 Agent 전용
git switch -c agent/<issue-number>-<short-description>
```

### 2) 작업 진행 중
- 코드를 수정 중인 동안에는 무분별하게 `git pull`을 실행하지 않습니다.
- 다른 PR이 `main`에 병합되었고, 내 작업과 동일한 **공통 모듈, API 계약, DB 스키마, 타입, 인증 모듈**에 영향을 준 경우에만 최신 `main` 반영 여부를 검토합니다.
- 충돌 가능성이 감지되면 즉시 작업을 멈추고 영향도를 분석합니다.

### 3) Pull Request 생성 직전
반드시 최신 `main`을 반영(`rebase`)하고 전체 검증을 재수행합니다:
```bash
git fetch origin
git rebase origin/main

# 프로젝트 검증 실행 (프로젝트 스택에 맞춤)
npm run lint       # 또는 pnpm run lint
npm run typecheck  # 또는 해당 타입 체크 명령
npm test           # 단위/통합 테스트
npm run build      # 빌드 무결성 확인
```

---

## 4. 충돌 발생 시 해결 절차 (Conflict Handling)

코드 충돌이 감지되면 다음 5단계를 거칩니다:
1. 충돌 발생 파일 목록을 확인합니다.
2. `main`에서 먼저 병합된 변경의 목적을 파악합니다.
3. 현재 브랜치의 변경 사항과 기능적으로 충돌하는지 분석합니다.
4. **확실히 안전한 경우에만** 충돌을 해결합니다.
5. **불확실한 경우 임의로 코드를 선택하지 말고 사람(Tech Lead)에게 즉시 보고합니다.**

### 충돌 보고서 필수 포함 항목
- 충돌 파일 목록
- `main` 변경 목적
- 현재 브랜치 변경 목적
- 기능 / 데이터 / 보안 영향도
- 가능한 해결 방안 및 권장안
- 사람의 판단이 필요한 핵심 질문
