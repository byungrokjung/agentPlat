# 기여 가이드

> AI Agent Platform에 기여해주셔서 감사합니다! 🎉

---

## 🚀 시작하기

### 1. 저장소 포크 & 클론

```bash
git clone https://github.com/YOUR_USERNAME/ai-agent-platform.git
cd ai-agent-platform
```

### 2. 환경 설정

```bash
# Frontend
cd frontend && pnpm install

# Backend
cd backend && uv sync

# Database
supabase start
```

### 3. 브랜치 생성

```bash
git checkout -b feature/기능명
# 또는
git checkout -b fix/버그명
```

---

## 📝 커밋 컨벤션

**Conventional Commits** 형식 사용:

```
<type>: <description>

[optional body]
```

### Type

| 타입 | 설명 |
|-----|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 스타일 (포맷팅) |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 변경 |

### 예시

```bash
git commit -m "feat: 에이전트 복제 기능 추가"
git commit -m "fix: 로그인 세션 만료 버그 수정"
git commit -m "docs: API 문서 업데이트"
```

---

## 🔀 Pull Request

### PR 전 체크리스트

- [ ] 코드 린트 통과 (`pnpm lint`, `ruff check`)
- [ ] 타입 체크 통과 (`pnpm type-check`)
- [ ] 테스트 통과 (`pytest`, `pnpm test`)
- [ ] 문서 업데이트 (필요시)

### PR 템플릿

```markdown
## 변경 사항
- 무엇을 변경했는지

## 관련 이슈
- closes #123

## 테스트
- 어떻게 테스트했는지

## 스크린샷 (UI 변경시)
```

---

## 🏗️ 코드 스타일

### TypeScript (Frontend)

```typescript
// ✅ Good
const fetchAgents = async (): Promise<Agent[]> => {
  const response = await api.get("/agents");
  return response.data;
};

// ❌ Bad
const fetchAgents = async () => {
  const response: any = await api.get("/agents");
  return response.data;
};
```

### Python (Backend)

```python
# ✅ Good
async def get_agent(agent_id: str) -> Agent:
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return Agent(**agent)

# ❌ Bad
async def get_agent(agent_id):
    agent = await db.agents.find_one({"id": agent_id})
    return agent
```

---

## 📁 파일 구조

### 새 API 엔드포인트 추가

```
backend/app/
├── api/v1/
│   └── new_feature.py      # 라우터
├── services/
│   └── new_feature.py      # 비즈니스 로직
└── models/
    └── new_feature.py      # Pydantic 모델
```

### 새 React 컴포넌트 추가

```
frontend/src/
├── components/
│   └── features/
│       └── NewFeature/
│           ├── index.tsx
│           ├── NewFeature.tsx
│           └── useNewFeature.ts
```

---

## 🧪 테스트

### Backend

```bash
cd backend
uv run pytest -v
```

### Frontend

```bash
cd frontend
pnpm type-check
pnpm lint
```

---

## 💬 질문 & 논의

- **Issue**: 버그 리포트, 기능 요청
- **Discussion**: 아이디어, 질문

---

## 📜 라이선스

기여하신 코드는 프로젝트 라이선스를 따릅니다.

감사합니다! 🙏
