<!--
[PR 제목 규칙]
[feat] 이메일 회원가입 API 추가
[fix] 결제 타임아웃 오류 처리
[docs] 로컬 개발 환경 문서 보완
[agent][feat] 프로필 수정 API 구현
-->

<!-- PR 생성 전 필수 점검 체크리스트 -->
### PR 생성 전 필수 점검
- [ ] 최신 origin/main을 반영했다 (`rebase origin/main`).
- [ ] 코드 충돌을 해결했다.
- [ ] lint를 통과했다.
- [ ] type check를 통과했다.
- [ ] unit test를 통과했다.
- [ ] 필요한 integration / e2e test를 실행했다.
- [ ] build를 통과했다.
- [ ] 디버그 코드 및 불필요한 console.log가 없다.
- [ ] Secret, Token, Password, 개인정보가 포함되지 않았다.
- [ ] 연결된 GitHub Issue가 존재한다.
- [ ] 변경 범위가 Issue의 정의 범위와 일치한다.
- [ ] 필요한 문서, API 명세, .env.example을 갱신했다.
- [ ] rollback 방법을 작성했다.

---

## 연결 Issue
- Closes #<issue-number>

## 변경 목적
<!-- 이 변경이 필요한 구체적인 이유를 작성하세요 -->

## 변경 내용
<!-- 실제 코드 변경 사항을 항목별로 요약하세요 -->
- 

## 완료 조건 확인 (Acceptance Criteria)
<!-- 연결된 Issue의 완료 조건과 일치해야 합니다 -->
- [ ] 완료 조건 1
- [ ] 완료 조건 2

## 변경하지 않은 범위
<!-- 본 PR에 의도적으로 포함하지 않은 작업 범위를 명시하세요 -->
- 

## 테스트 결과
- [ ] Lint
- [ ] Type Check
- [ ] Unit Test
- [ ] Integration Test
- [ ] E2E Test
- [ ] Build
- [ ] Secret Scan
- [ ] Dependency Scan

**실행한 명령:**
```bash
# 실제 로컬에서 실행한 검증 명령어를 기록하세요
```

---

## 위험도 평가
- [ ] **Low** (문구/스타일/단순 UI/문서 수정: CI 통과 + 사람 1인 승인)
- [ ] **Medium** (일반 CRUD/API/버그 수정/테스트: CI 통과 + QA 결과 확인 + 사람 1인 승인)
- [ ] **High** (인증/인가/외부API/DB마이그레이션/인프라: 사람 집중 검토 + Lead 승인 + Rollback 계획)
- [ ] **Critical** (결제/개인정보/Secret/배포/DB파괴적수정: 자동화 중지 + 명시적 사람 승인 + 보안 기록)

**위험도 사유:**
<!-- 선택한 위험도에 대한 근거를 설명하세요 -->

---

## AI Agent 작업 내역 (AI가 작성한 경우 필수)
- **사용 Agent**: <!-- 예: Antigravity Orchestrator, Cursor, Claude Code 등 -->
- **Agent가 수행한 작업**: 
- **Agent가 변경한 주요 파일**: 
- **Agent가 확신하지 못하는 부분**: <!-- 사람의 판단/검증이 필요한 모호한 점 -->

## 사람이 확인해야 할 항목 (Human Review Checklist)
<!-- 코드 리뷰어가 중점적으로 확인해야 할 사항 -->
- 

## Rollback 방법
<!-- 문제 발생 시 이전 안정 상태로 되돌리는 구체적인 절차 -->
- 
