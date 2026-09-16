# exCor: 부산 골목 밸런서 (Busan Alley Budget Route Planner)

> **교통비·식비·입장료를 정해진 예산(3만~10만원)에 딱 맞춰주는 부산 골목상권 맞춤 여행 설계기 (MVP)**
> 팀(5인)과 AI Agent(7대 역할 모델)가 함께 만들어가는 협업 프로젝트

## 🌊 제품 소개 (Product Overview)
**부산 골목 밸런서**는 뚜벅이/MZ 여행자가 자신의 총 예산(3만~10만 원)을 입력하면, 부산 5대 골목상권(전포, 영도, 해리단길, 보수동, 망미단길)을 즐길 수 있도록 **[교통비 + 식비 + 입장료] 3대 비용을 오차 없이 역산 배분**해주는 모바일 최적화 여행 설계기입니다.

- **3대 비용 밸런서 엔진**: 대중교통 환승 요금 사전 차감 및 식비/체험비 최적 배분
- **3-Pillar 분할 시각화 게이지**: 교통비, 식비·카페, 입장·체험, 골목 비상금 게이지 바
- **부산 5대 골목상권 큐레이션**: 전포, 영도 흰여울, 해리단길, 보수동 책방골목, 망미단길
- **실시간 스팟 교체(Swap)**: 대체 스팟 선택 시 예산 및 지출 실시간 갱신
- **네이버/카카오 지도 연동 & 원클릭 일정 복사**: 친구 공유 최적화

---

## 📁 프로젝트 구조 및 디렉터리 분리 원칙

`exCor`는 **"실제 제품 코드(Product Code)가 1순위이며, 협업 규칙은 제품 개발을 지원하는 보이지 않는 백그라운드 인프라여야 한다"**는 원칙에 따라 디렉터리가 완벽히 분리되어 있습니다.

```text
exCor/
├── src/                               # ⭐️ [핵심] 실제 제품 구현 소스코드 영역 (비즈니스 로직, API, UI 등)
│
├── .agents/                           # 🤖 [격리] AI Agent 전용 거버넌스 및 규칙 영역 (Product-Decoupled)
│   ├── AGENTS.md                      # AI Agent 공통 운영 원칙 및 절대 금지 규칙
│   └── rules/                         # 에이전트 자동 로드 규칙
│
├── .github/                           # ⚙️ [플랫폼] GitHub 공식 연동 설정
│   ├── ISSUE_TEMPLATE/                # Feature, Bug, Refactor 등 이슈 양식
│   └── pull_request_template.md       # 사전점검, 위험도 평가 포함 PR 템플릿
│
├── docs/                              # 📚 [문서] 기술 및 프로젝트 문서
│   ├── governance/                    # 사람/팀을 위한 거버넌스 및 리뷰 가이드
│   ├── templates/                     # QA 및 PR 판단 보고서 양식
│   └── prompts/                       # AI Agent 마스터 초기화 프롬프트 개정본
│
├── scripts/                           # 🛠️ [도구] GitHub 라벨 등 개발 지원 유틸리티
│
├── README.md                          # 본 문서 (제품 중심 안내)
├── CONTRIBUTING.md                     # 브랜치/커밋/동기화 표준 개발 가이드
└── .gitignore                         # Secret 및 빌드 부산물 무시 설정
```

---

## 🚀 빠른 시작 (Getting Started)

### 1. 의존성 설치 및 로컬 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Vite, http://localhost:5173/)
npm run dev

# 단위 테스트 실행 (Vitest 5개 테스트)
npm test

# 프로덕션 빌드 및 타입 검사
npm run build
```

### 2. 새 작업 브랜치 생성
```bash
git switch main
git pull --ff-only origin main
git switch -c feature/<issue-number>-<short-description>
# 또는 Agent 전용 브랜치
git switch -c agent/<issue-number>-<short-description>
```

---

## 🤖 AI Agent 협업 및 거버넌스 (Overview)

팀(5인)과 AI Agent 간의 안전한 협업 규칙은 [`.agents/`](.agents/) 및 [`docs/governance/`](docs/governance/)에 완벽히 격리되어 운영됩니다.

- **Source of Truth**: GitHub Issue(작업 계약), Project(상태), PR(검토), main(공식 코드)
- **절대 금지 규칙**: `main` 직접 Push/Merge 금지, Agent PR 자체 승인 금지, Secret/.env 커밋 금지
- **7대 Agent 모델**: Orchestrator, Planner, Architect, Developer, Reviewer, QA, DevOps
- **상세 가이드**:
  - [AI Agent 운영 규칙 (`.agents/AGENTS.md`)](.agents/AGENTS.md)
  - [Git 협업 표준 (`CONTRIBUTING.md`)](CONTRIBUTING.md)
  - [위험도 매트릭스 (`docs/governance/risk-approval-matrix.md`)](docs/governance/risk-approval-matrix.md)
  - [마스터 프롬프트 개정본 (`docs/prompts/agent-collaboration-master-prompt.md`)](docs/prompts/agent-collaboration-master-prompt.md)
