# exCor

> **5인 개발팀과 멀티 로컬 AI Agent가 안전하고 일관되게 협업하는 프로젝트 표준 템플릿**

`exCor`는 GitHub를 유일한 공식 상태(Source of Truth)로 삼고, 사람(5인)과 여러 AI Agent(Antigravity, Cursor, Claude Code, GitHub Copilot 등)가 체계적인 규칙과 위험도 기반 승인 절차를 통해 협업할 수 있도록 설계된 저장소입니다.

---

## 📌 핵심 운영 원칙 (Source of Truth)

1. **GitHub Issue**: 모든 작업의 공식 계약 (목적, 범위, Acceptance Criteria)
2. **GitHub Project & Labels**: 실시간 작업 상태와 우선순위 관리
3. **Git Branch**: 격리된 작업 공간 (`feature/...`, `agent/...`)
4. **Pull Request**: 코드 제안, 테스트 결과, 위험 분석, 검토 기록
5. **CI / Automation**: 객관적 자동 품질 검증 (Lint, Type Check, Test, Build)
6. **main Branch**: 합의되고 검증된 배포 가능한 공식 최신 코드 (직접 Push/Merge 금지)

---

## 👥 사람과 AI Agent의 역할 분담

AI Agent는 **실행자(Worker) 및 분석자(Analyst)**이며, 최종 승인 및 책임은 **사람(Human)**에게 있습니다.

### AI Agent 역할 모델 (7 Roles)
- **Orchestrator Agent**: 요구사항 분해, 우선순위 조율, 충돌 방지, 종합 판단 보고서 작성
- **Planner Agent**: User Story 및 MVP 범위 정의, Acceptance Criteria 작성
- **Architect Agent**: 시스템 설계, 폴더 구조, ADR 초안 작성 (DB/인증 변경 시 사람 승인 필수)
- **Developer Agent**: 승인된 Issue 범위 내 기능 구현 및 테스트 코드 작성
- **PR Review Agent**: 10대 항목 검토 및 5단계 판정 (Blocker, Required, Warning, Suggestion, Info)
- **QA Agent**: Acceptance Criteria 기반 시나리오 테스트 및 QA 결과 보고서 작성
- **DevOps / Docs Agent**: 문서 및 환경 설정, CI 워크플로 초안 관리

---

## 🛡️ 위험도 분류 및 승인 요건 (Risk Matrix)

| 위험도 | 대상 예시 | 승인 조건 |
|---|---|---|
| **Low** | 단순 문구, 스타일, UI 레이아웃, 문서 수정 | CI 통과 + 사람 1인 승인 |
| **Medium** | 일반 CRUD, 비즈니스 API, 일반 버그 수정, 테스트 추가 | CI 통과 + QA Pass 확인 + 사람 1인 승인 |
| **High** | 인증/인가, 외부 API, DB 마이그레이션, 공통 계약, CI/인프라 | Tech Lead 승인 + 필요 시 2인 + Rollback 계획 |
| **Critical** | 결제/환불, 개인정보(PII), Secret 노출, 운영 배포/DB 삭제 | 자동화 중지 + 명시적 사람 승인 + 보안 기록 |

---

## 📂 프로젝트 구조

```text
exCor/
├── .agents/
│   └── rules/
│       └── collaboration-rules.md     # Antigravity/Agent 작업 시 자동 로드되는 행동 규칙
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── 01_feature.md              # [Feature] 신규 기능 요구사항 템플릿
│   │   ├── 02_bug.md                  # [Bug] 결함 보고 템플릿
│   │   ├── 03_refactor.md             # [Refactor] 구조 개선 템플릿
│   │   ├── 04_docs_chore.md           # [Docs/Chore] 일반 작업 템플릿
│   │   └── config.yml                 # 템플릿 강제 설정
│   └── pull_request_template.md       # PR 필수 본문 및 사전 점검 체크리스트
├── docs/
│   ├── governance/
│   │   ├── agent-role-model.md        # 7대 Agent 상세 권한 및 행동 경계
│   │   ├── git-workflow.md            # 브랜치 전략, Conventional Commits, 동기화/충돌 규칙
│   │   ├── risk-approval-matrix.md    # 위험도 분류 및 승인 정책
│   │   └── pr-review-criteria.md      # PR Review Agent 10대 검토 기준 및 등급 판정
│   └── templates/
│       ├── qa-test-report.md          # QA Agent 결과 보고서 양식
│       └── pr-judgment-report.md      # 사람에게 전달하는 최종 PR 판단 보고서 양식
├── scripts/
│   ├── setup-github-labels.ps1        # GitHub 표준 29개 라벨 자동 생성 스크립트 (PowerShell)
│   └── setup-github-labels.sh         # GitHub 표준 29개 라벨 자동 생성 스크립트 (Bash)
├── AGENTS.md                          # 모든 AI Agent 공통 운영 철학 및 절대 금지 규칙
├── CONTRIBUTING.md                     # 브랜치/커밋/동기화 표준 개발 가이드
├── README.md                          # 본 문서
└── .gitignore                         # 표준 파일 무시 설정
```

---

## 🚀 빠른 시작 (Getting Started)

### 1. GitHub Labels 설정
GitHub CLI(`gh`)가 설치되어 있고 로그인된 상태라면, 아래 명령어로 29개 표준 라벨을 즉시 저장소에 동기화할 수 있습니다:
```powershell
# Windows PowerShell
.\scripts\setup-github-labels.ps1
```
```bash
# Mac / Linux
chmod +x ./scripts/setup-github-labels.sh
./scripts/setup-github-labels.sh
```

### 2. 새 작업 시작 (Git 브랜치)
```bash
git switch main
git pull --ff-only origin main
git switch -c feature/<issue-number>-<short-description>
# 또는 Agent 전용 브랜치
git switch -c agent/<issue-number>-<short-description>
```

### 3. 커밋 및 PR 생성
Conventional Commits 형식을 준수하여 커밋합니다:
```bash
git commit -m "feat(auth): add email signup endpoint"
```
PR 생성 전 최신 main과 rebase 후 로컬 검증을 마칩니다:
```bash
git fetch origin
git rebase origin/main
```

---

## 🚫 절대 금지 규칙 (Never)
- `main` 브랜치에 직접 Push / Merge 금지
- AI Agent 자체 PR Approve / Merge 금지
- Secret, Token, 패스워드, `.env` 커밋 금지
- 사람 승인 없는 Production 배포 및 DB 파괴적 명령 금지
