#!/usr/bin/env bash
# GitHub Labels Setup Script for exCor
# Requires GitHub CLI (gh) logged in: gh auth status

set -e

echo "Setting up GitHub labels for exCor..."

declare -A LABELS
LABELS=(
  ["type:feature"]="a2eeef:새로운 기능 구현"
  ["type:bug"]="d73a4a:버그 및 결함 수정"
  ["type:refactor"]="cfd3d7:기능 변화 없는 코드 구조 개선"
  ["type:docs"]="0075ca:문서 추가 및 수정"
  ["type:test"]="bfd4f2:테스트 코드 추가/수정"
  ["type:chore"]="fef2c0:빌드, 패키지, 설정 변경"

  ["status:backlog"]="ededed:아이디어 또는 미정리 요청"
  ["status:refinement"]="e4e669:요구사항/범위/완료조건 정리 중"
  ["status:ready"]="0e8a16:개발 착수 가능한 준비 완료 상태"
  ["status:in-progress"]="fbca04:작업 브랜치에서 구현 진행 중"
  ["status:review"]="1d76db:PR 생성 및 CI / 코드 리뷰 대기"
  ["status:qa"]="d4c5f9:기능 및 회귀 테스트 검증 중"
  ["status:release"]="006b75:QA 완료 및 배포 준비 단계"
  ["status:done"]="0e8a16:main 병합 및 검증 완료"
  ["status:blocked"]="b60205:외부 의존성, 충돌 등으로 진행 불가"

  ["agent:orchestrator"]="5319e7:Orchestrator Agent 담당 작업"
  ["agent:planner"]="5319e7:Planner Agent 담당 작업"
  ["agent:architect"]="5319e7:Architect Agent 담당 작업"
  ["agent:developer"]="5319e7:Developer Agent 담당 작업"
  ["agent:reviewer"]="5319e7:PR Review Agent 담당 작업"
  ["agent:qa"]="5319e7:QA Agent 담당 작업"
  ["agent:devops"]="5319e7:DevOps/Docs Agent 담당 작업"

  ["risk:low"]="c2e0c6:단순 문구/UI/문서 수정"
  ["risk:medium"]="fef2c0:일반 CRUD/API/버그 수정"
  ["risk:high"]="f9d0c4:인증/결제/DB/인프라/환경변수 변경"
  ["risk:critical"]="b60205:결제/개인정보/Secret/운영DB 변경"

  ["human-approval-required"]="d93f0b:사람의 명시적 사전/최종 승인 필요"
  ["needs-design"]="c5def5:설계 및 아키텍처 검토 선행 필요"
  ["needs-review"]="bfdadc:집중 코드 리뷰 대기"
)

for name in "${!LABELS[@]}"; do
  val="${LABELS[$name]}"
  color="${val%%:*}"
  desc="${val#*:}"
  echo "Creating/updating label: $name ($color)..."
  gh label create "$name" --color "$color" --description "$desc" --force || true
done

echo "All 29 standard labels configured successfully!"
