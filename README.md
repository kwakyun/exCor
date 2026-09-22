# exCor · 부산 골목 밸런서

정해진 여행 예산 안에서 부산 골목상권의 방문 장소와 비용을 계획하는 MVP입니다.
교통비·식비·체험비를 함께 살펴보고 장소를 바꿀 때 예산이 어떻게 달라지는지 보여줍니다.

## 주요 기능

- 전포·영도·해리단길·보수동·망미단길의 큐레이션 데이터 탐색
- 여행 예산에 따른 비용 계산과 장소 교체
- 계획·지출 화면과 외부 지도 연결

기술: React 18, TypeScript, Vite, Vitest. 현재 실행 스크립트는 프론트엔드 MVP 기준입니다.

## 핵심 코드와 설계

| 확인할 내용 | 코드·문서 |
| --- | --- |
| 비용 계산과 테스트 | [budgetCalculator.ts](src/services/budgetCalculator.ts), [테스트](src/services/__tests__/budgetCalculator.test.ts) |
| 화면과 데이터 흐름 | [App.tsx](src/App.tsx), [지역 데이터](src/data/busanAlleys.ts) |
| 문제 정의 | [제품 요구사항](docs/product/prd-busan-alley-balancer.md) |
| 설계 선택 | [아키텍처](docs/architecture/system-architecture.md), [ADR](docs/architecture/adr/) |
| 다음 단계 | [확장 로드맵](docs/architecture/phase2-roadmap-and-integration.md) |

## 실행과 검증

~~~bash
git clone https://github.com/kwakyun/exCor.git
cd exCor
npm ci
npm run dev
~~~

터미널에 표시되는 Vite 주소에서 예산 입력 → 장소 선택·교체 → 비용 확인 순서로 살펴봅니다.

~~~bash
npm test
npm run build
~~~

## 현재 범위

- 장소와 요금은 저장된 데이터·계산 규칙을 바탕으로 하며 실제 방문 시점의 가격이나 영업 상태를 보장하지 않습니다.
- 로드맵의 외부 데이터·DB 연동 계획을 모두 구현한 서비스로 보지 않습니다.
- 저장소는 팀·AI 협업 프로젝트로 소개되어 있습니다. 개인별 구현 범위와 과거 검증 결과는 별도 근거와 함께 확인해야 합니다.

## 작업 기록

[기여 가이드](CONTRIBUTING.md) · [AI 활용 기록](AI_NOTES.md) · [변경 기록](CHANGELOG.md) · [기존 QA 기록](docs/qa-test-report-mvp.md)

기존 협업 규칙과 프롬프트는 [.agents](.agents/) 및 [거버넌스 문서](docs/governance/)에서 볼 수 있습니다.
