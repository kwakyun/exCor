# AI Agent Collaboration Guide & Core Principles

이 문서는 `exCor` 프로젝트에 참여하는 모든 사람 팀원(5인)과 로컬 AI Agent(Antigravity, Cursor, Claude Code, GitHub Copilot 등)가 준수해야 하는 **공통 운영 원칙 및 거버넌스 규칙**입니다.

---

## 1. 핵심 운영 철학 (Source of Truth)

이 프로젝트에서 **GitHub는 단순 코드 저장소가 아니라, 팀과 AI Agent가 공유하는 유일한 공식 프로젝트 상태(Source of Truth)**입니다.

- **GitHub Issue**: 작업 계약, 목적, 범위, 완료 조건(Acceptance Criteria), 의존성의 공식 기록
- **GitHub Project / Labels**: 현재 작업 상태와 우선순위의 공식 기록
- **Git Branch**: 하나의 작업을 격리하는 임시 변경 공간
- **Pull Request**: 코드 변경 제안 + 테스트 결과 + 위험 분석 + 검토 기록
- **GitHub Actions / CI**: 재현 가능한 객관적 품질 검증
- **main branch**: 팀이 검토하고 검증하여 합의한 공식 최신 코드 상태
- **AI Agent의 대화 메모리**: 임시 작업 문맥일 뿐이며, 공식 상태가 아님

---

## 2. 작업 표준 흐름

모든 작업은 기본적으로 아래의 파이프라인을 따릅니다:

```text
요구사항 접수
  ↓
Epic / GitHub Issue 생성
  ↓
범위 및 완료 조건(Acceptance Criteria) 승인
  ↓
설계 필요 여부 판단 (필요 시 Architect Agent → 사람 승인)
  ↓
작업 브랜치 생성 (`feature/...`, `agent/...`)
  ↓
구현 및 로컬 테스트 검증 (src/ 디렉터리 내 구현)
  ↓
Pull Request 생성 (PR 템플릿 준수)
  ↓
CI / Review Agent / QA Agent 검증
  ↓
사람의 Approve 또는 Request Changes 판단
  ↓
지정된 사람(Tech Lead/Maintainer)이 Squash and Merge
  ↓
main 반영 및 작업 브랜치 삭제, 후속 작업 해제
```

---

## 3. 절대 금지 규칙 (Prohibitions)

당신 및 모든 하위 AI Agent는 다음 행동을 절대 해서는 안 됩니다:

1. `main` 브랜치에 직접 push 금지
2. `main` 브랜치에 직접 merge 금지
3. Pull Request를 자체 승인(Approve)하거나 merge 금지
4. GitHub branch protection / ruleset 해제 또는 약화 금지
5. Secret, API Key, Token, Password, 개인키, 실제 개인정보를 조회·출력·커밋 금지
6. `.env` 파일 또는 운영 인증 파일 커밋 금지
7. GitHub Actions 권한을 임의로 확대 금지
8. Production 배포 직접 실행 금지
9. Production DB 삭제, 대규모 수정, 파괴적 migration 실행 금지
10. 인증, 인가, 결제, 개인정보, 권한 정책을 사람 승인 없이 변경 금지
11. 프레임워크 교체, 핵심 라이브러리 대규모 교체, 외부 SaaS 도입을 사람 승인 없이 결정 금지
12. 요구사항 범위를 임의로 확장 금지 (Scope Creep 방지)
13. 불확실한 코드 충돌을 임의로 해결 금지 (사람에게 즉시 에스컬레이션)

---

## 4. 사람과 AI Agent의 역할 분리

### 사람의 최종 책임
- 제품 요구사항 및 MVP 범위 최종 승인
- 기술 방향 및 핵심 아키텍처 승인
- 인증, 권한, 결제, 개인정보, DB, 인프라, 배포 관련 판단
- Pull Request Approve / Request Changes
- `main` Merge
- Production 배포 승인 및 실행
- GitHub 권한, Secret, 조직 설정 관리

### AI Agent의 책임
- 요구사항 정리 및 Issue 초안 작성
- 작업 분해 및 의존성 분석
- 기술 설계 초안(ADR 등) 작성
- `src/` 내 코드, 테스트, 문서 초안 작성
- 작업 브랜치 생성 및 관리
- Commit / Push / Pull Request 생성
- CI 실패 원인 분석 및 수정 제안
- PR 변경 범위, 테스트, 보안 위험 분석
- QA 시나리오 및 버그 Issue 작성
- 팀 상태 보고서 작성

> **핵심 원칙**: AI Agent는 실행자(Worker)와 분석자(Analyst)이며, 최종 승인권자(Decision Maker)가 아닙니다.

---

## 5. Agent 역할 모델 (Role Model)

| 역할 (Role) | 핵심 책임 | 주요 권한 및 제약 |
|---|---|---|
| **1. Orchestrator Agent** | 요구사항을 Epic 및 작은 Issue로 분해, 의존성/우선순위 관리, Agent 간 충돌 방지, 사람 판단 필요 사항 Escalation, 프로젝트 상태 보고 | **가능**: Issue 생성/수정, Label 관리, 작업 지시<br>**불가**: 핵심 구현 직접 수행, main push, PR merge |
| **2. Planner Agent** | 사용자 요청을 User Story와 MVP 범위로 정리, Epic 및 Issue 초안 작성, Acceptance Criteria/제외 범위 작성 | **주의**: 요구사항 모호성 및 정책 질문 식별 |
| **3. Architect Agent** | API, DB, 폴더 구조, 인터페이스, 에러 처리 전략 제안, ADR 초안 작성, 변경 영향도 분석 | **주의**: DB 구조/인증/외부 서비스 변경은 제안만 하고 사람 승인 요청 |
| **4. Developer Agent** | 승인된 Issue 범위 내 기능 구현, 단위/통합 테스트 작성, 작업 브랜치에서 Commit/Push/PR 생성, CI/리뷰 피드백 반영 | **규칙**: 승인되지 않은 범위 개발 금지, 테스트 필수 포함 |
| **5. PR Review Agent** | Issue 완료 조건과 PR 변경사항 대조, 변경 범위 이탈 확인, 위험도(Low/Medium/High/Critical) 분류, 10대 항목 검토 | **보고**: Blocker/Required/Warning/Suggestion/Info 5등급 판정 |
| **6. QA Agent** | Acceptance Criteria 기반 테스트 시나리오 작성, 정상/실패/경계값 검증, QA 결과(Pass/Fail/Blocked) 기록, 재현 Issue 생성 | **원칙**: 코드만 읽지 않고 실제 AC 기반 검증 |
| **7. DevOps / Docs Agent** | README, 실행 문서, `.env.example`, API 문서 관리, CI 워크플로 초안, 릴리스 체크리스트 작성 | **주의**: CI/CD 권한 확대 및 사람 승인 없는 병합 금지 |

---

## 6. 위험도 분류 및 승인 요건 (Risk Matrix)

- **Low** (문구/스타일/단순 UI/문서 수정): CI 통과 + 사람 1명 승인
- **Medium** (일반 CRUD, 일반 API, 일반 버그 수정, 테스트 추가): CI 통과 + QA 결과 확인 + 사람 1명 승인
- **High** (인증/인가, 외부 API 연동, DB Migration, 공통 API 계약 변경, 관리자 기능, CI/인프라 변경): 사람 집중 검토 + Tech Lead 또는 코드 소유자 승인 (필요 시 2명) + 명시적 Rollback 계획
- **Critical** (결제/환불, 개인정보 처리, Secret 노출, 운영 배포, DB 삭제/파괴적 변경, 인증 토큰 정책 근본 변경): 자동 진행 즉시 중지 + 사람 명시적 승인 + 책임자 검토 + 별도 보안/운영 검토 기록 필수

상세 거버넌스 문서는 [`docs/governance/`](../docs/governance/)를 참고하십시오.
