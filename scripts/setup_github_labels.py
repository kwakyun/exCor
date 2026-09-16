#!/usr/bin/env python3
"""
GitHub Labels Setup Script for exCor
Usage:
    export GITHUB_TOKEN=your_token   (or set GITHUB_TOKEN=... on Windows)
    python scripts/setup_github_labels.py
"""

import os
import sys
import json
import urllib.request
import urllib.error

REPO = "kwakyun/exCor"
TOKEN = os.environ.get("GITHUB_TOKEN")

LABELS = [
    # Types
    {"name": "type:feature", "color": "a2eeef", "description": "새로운 기능 구현"},
    {"name": "type:bug", "color": "d73a4a", "description": "버그 및 결함 수정"},
    {"name": "type:refactor", "color": "cfd3d7", "description": "기능 변화 없는 코드 구조 개선"},
    {"name": "type:docs", "color": "0075ca", "description": "문서 추가 및 수정"},
    {"name": "type:test", "color": "bfd4f2", "description": "테스트 코드 추가/수정"},
    {"name": "type:chore", "color": "fef2c0", "description": "빌드, 패키지, 설정 변경"},

    # Status
    {"name": "status:backlog", "color": "ededed", "description": "아이디어 또는 미정리 요청"},
    {"name": "status:refinement", "color": "e4e669", "description": "요구사항/범위/완료조건 정리 중"},
    {"name": "status:ready", "color": "0e8a16", "description": "개발 착수 가능한 준비 완료 상태"},
    {"name": "status:in-progress", "color": "fbca04", "description": "작업 브랜치에서 구현 진행 중"},
    {"name": "status:review", "color": "1d76db", "description": "PR 생성 및 CI / 코드 리뷰 대기"},
    {"name": "status:qa", "color": "d4c5f9", "description": "기능 및 회귀 테스트 검증 중"},
    {"name": "status:release", "color": "006b75", "description": "QA 완료 및 배포 준비 단계"},
    {"name": "status:done", "color": "0e8a16", "description": "main 병합 및 검증 완료"},
    {"name": "status:blocked", "color": "b60205", "description": "외부 의존성, 충돌 등으로 진행 불가"},

    # Agents
    {"name": "agent:orchestrator", "color": "5319e7", "description": "Orchestrator Agent 담당 작업"},
    {"name": "agent:planner", "color": "5319e7", "description": "Planner Agent 담당 작업"},
    {"name": "agent:architect", "color": "5319e7", "description": "Architect Agent 담당 작업"},
    {"name": "agent:developer", "color": "5319e7", "description": "Developer Agent 담당 작업"},
    {"name": "agent:reviewer", "color": "5319e7", "description": "PR Review Agent 담당 작업"},
    {"name": "agent:qa", "color": "5319e7", "description": "QA Agent 담당 작업"},
    {"name": "agent:devops", "color": "5319e7", "description": "DevOps/Docs Agent 담당 작업"},

    # Risks
    {"name": "risk:low", "color": "c2e0c6", "description": "단순 문구/UI/문서 수정"},
    {"name": "risk:medium", "color": "fef2c0", "description": "일반 CRUD/API/버그 수정"},
    {"name": "risk:high", "color": "f9d0c4", "description": "인증/결제/DB/인프라/환경변수 변경"},
    {"name": "risk:critical", "color": "b60205", "description": "결제/개인정보/Secret/운영DB 변경"},

    # Governance Flags
    {"name": "human-approval-required", "color": "d93f0b", "description": "사람의 명시적 사전/최종 승인 필요"},
    {"name": "needs-design", "color": "c5def5", "description": "설계 및 아키텍처 검토 선행 필요"},
    {"name": "needs-review", "color": "bfdadc", "description": "집중 코드 리뷰 대기"}
]

def main():
    if not TOKEN:
        print("Error: GITHUB_TOKEN environment variable is required.")
        print("Please set GITHUB_TOKEN with repository 'repo' or 'issues' scope.")
        sys.exit(1)

    base_url = f"https://api.github.com/repos/{REPO}/labels"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "exCor-Bootstrap"
    }

    print(f"Setting up 29 labels on GitHub repository {REPO}...")
    for item in LABELS:
        payload = json.dumps(item).encode("utf-8")
        req = urllib.request.Request(base_url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                print(f" [+] Created: {item['name']}")
        except urllib.error.HTTPError as e:
            if e.code == 422:
                # Already exists, try PATCH
                patch_url = f"{base_url}/{urllib.parse.quote(item['name'])}"
                patch_req = urllib.request.Request(patch_url, data=payload, headers=headers, method="PATCH")
                try:
                    with urllib.request.urlopen(patch_req) as resp2:
                        print(f" [*] Updated: {item['name']}")
                except Exception as patch_err:
                    print(f" [!] Error updating {item['name']}: {patch_err}")
            else:
                print(f" [!] Error creating {item['name']}: {e}")

    print("\nCompleted label synchronization.")

if __name__ == "__main__":
    main()
