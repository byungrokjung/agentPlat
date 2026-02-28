# Commit, Push, PR 한번에 실행

현재 변경사항을 커밋하고 푸시한 뒤 PR을 자동으로 생성합니다.

## 1단계: 현재 상태 파악

아래 명령어를 실행해서 현재 상태를 파악하세요:

```bash
git status && echo "---DIFF---" && git diff --stat && echo "---BRANCH---" && git branch --show-current && echo "---LOG---" && git log --oneline -5
```

## 2단계: 변경사항 분석 및 커밋

1. 변경사항을 분석하여 conventional commit 메시지를 작성합니다
   - `feat:` 새 기능, `fix:` 버그 수정, `refactor:` 리팩토링, `docs:` 문서
2. 관련 파일만 `git add`로 스테이징합니다 (`.env`, 시크릿 파일 제외)
3. 커밋을 생성합니다

## 3단계: 푸시

```bash
git push -u origin $(git branch --show-current)
```

## 4단계: PR 생성

`gh pr create`로 PR을 생성합니다:
- **title**: 커밋 메시지 기반 (70자 이내)
- **body**: 변경사항 요약 + 테스트 계획
- **base**: main 브랜치

```bash
gh pr create --title "PR 제목" --body "$(cat <<'EOF'
## Summary
- 변경사항 요약

## Test plan
- [ ] 테스트 항목

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 5단계: 결과 출력

PR URL을 출력하고 완료를 알립니다.

## 주의사항

- main 브랜치에서는 실행하지 마세요
- `.env`, 시크릿 파일이 포함되지 않았는지 반드시 확인
- 커밋 전 `pnpm type-check` 또는 `uv run pytest`가 통과하는지 확인 권장
