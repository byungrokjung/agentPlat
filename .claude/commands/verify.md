# 앱 전체 검증 (Verification Loop)

Boris Cherny의 "가장 중요한 팁" — 검증 피드백 루프.
프론트엔드 빌드 + 백엔드 테스트 + 타입/린트 체크를 한번에 실행합니다.

## 실행 순서

### 1. 백엔드 검증

```bash
cd /home/byungrok/projects/ai-agent-platform/backend && uv run ruff check . 2>&1 | tail -20
```

```bash
cd /home/byungrok/projects/ai-agent-platform/backend && uv run pytest -v --tb=short 2>&1 | tail -30
```

### 2. 프론트엔드 검증

```bash
cd /home/byungrok/projects/ai-agent-platform/frontend && pnpm type-check 2>&1 | tail -20
```

```bash
cd /home/byungrok/projects/ai-agent-platform/frontend && pnpm lint 2>&1 | tail -20
```

```bash
cd /home/byungrok/projects/ai-agent-platform/frontend && pnpm build 2>&1 | tail -20
```

## 결과 리포트

위 명령어들을 모두 실행한 뒤 아래 형식으로 결과를 요약합니다:

```
## 검증 결과

### Backend
- Ruff Check: ✅/❌
- Pytest: ✅ X passed / ❌ X failed

### Frontend
- Type Check: ✅/❌
- Lint: ✅/❌
- Build: ✅/❌

### 종합: ✅ 전체 통과 / ❌ 수정 필요
```

## 에러 발견 시

에러가 발견되면:
1. 에러 내용을 분석합니다
2. 자동으로 수정을 시도합니다
3. 수정 후 해당 검증을 다시 실행합니다
4. 전체 통과할 때까지 반복합니다
