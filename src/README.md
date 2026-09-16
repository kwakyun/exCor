# Product Source Code (`src/`)

이 디렉터리는 `exCor` 프로젝트의 **실제 제품(서비스) 소스 코드**가 위치하는 전용 영역입니다.

## 🎯 설계 원칙
- **제품 중심 격리 (Product-First)**: AI 에이전트 규칙이나 거버넌스 문서는 여기에 포함되지 않으며, 오직 순수 애플리케이션 코드(도메인 로직, 컴포넌트, 컨트롤러, 유틸, 단위 테스트)만 위치합니다.
- 프로젝트 기술 스택(Next.js, FastAPI, Spring 등)이 확정되면, 해당 프레임워크의 표준 구조(예: `src/app`, `src/components`, `src/modules`, `src/tests`)로 세부 디렉터리가 확장됩니다.
