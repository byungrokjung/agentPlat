# CLAUDE.md

> AI 에이전트 빌더 플랫폼 MVP — 사용자가 Claude API로 커스텀 에이전트를 만들고 실행하는 플랫폼

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui / pnpm
- **Backend**: FastAPI (Python 3.11+) / uv
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)

## Deployment

- **Frontend**: `agentplat-production-cf45.up.railway.app`
- **Backend**: `agentplat-production.up.railway.app`

## Project Structure

```
ai-agent-platform/
├── frontend/src/
│   ├── app/              # App Router 페이지
│   ├── components/       # ui/ (공통) + features/ (기능별)
│   ├── hooks/            # 커스텀 훅
│   ├── lib/              # 유틸리티, API 클라이언트
│   ├── stores/           # Zustand 상태 관리
│   └── types/            # TypeScript 타입
├── backend/app/
│   ├── api/v1/           # API 라우터
│   ├── core/             # 설정, 보안, 예외 처리
│   ├── models/           # Pydantic 모델
│   ├── services/         # 비즈니스 로직 (agents/ 포함)
│   └── utils/            # 유틸리티
├── supabase/migrations/  # DB 마이그레이션
├── usecases/             # 유즈케이스 (content-factory, youtube-transcript 등)
└── .claude/              # skills/, commands/, settings.json
```

## Critical Rules

1. **main 브랜치 직접 커밋 금지** — hooks에서 자동 차단됨. 반드시 feature/fix 브랜치 사용
2. **API 키, 시크릿 절대 커밋 금지** — `.env` 파일만 사용
3. **TypeScript `any` 타입 금지** → `unknown` 사용, strict 모드 필수
4. **Python 타입 힌트 필수** — 모든 함수에 타입 정의
5. **DB 스키마 변경 시 마이그레이션 필수** — 직접 DB 수정 금지
6. **서버 컴포넌트 우선** — 상태/이벤트 필요 시에만 `'use client'`

## Git Workflow

- 브랜치명: `feature/{기능명}`, `fix/{버그명}`, `refactor/{대상}`
- 커밋 메시지: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- PR 전 lint + type-check 통과 필수

## Dev Commands

```bash
# Frontend
cd frontend && pnpm dev              # 개발 서버 :3000
cd frontend && pnpm build && pnpm lint && pnpm type-check

# Backend
cd backend && uv run uvicorn main:app --reload   # 개발 서버 :8000
cd backend && uv run pytest                       # 테스트
cd backend && uv run ruff check . && uv run ruff format .  # 린트+포맷

# Database
supabase start && supabase db reset
supabase migration new <name>
```

## API Conventions

- URL: kebab-case (`/api/v1/ai-agents`)
- JSON 속성: camelCase (`agentId`, `createdAt`)
- 에러 응답: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`
- 페이지네이션: `?page=1&limit=20`

## DB Conventions

- 테이블: snake_case 복수형 (`ai_agents`, `agent_executions`)
- 컬럼: snake_case (`created_at`, `user_id`)
- PK: `id` (UUID, `gen_random_uuid()`)
- FK: `{table}_id` 패턴
- 필수 컬럼: `id`, `created_at`, `updated_at`

## Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Backend (.env)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
CORS_ORIGINS=http://localhost:3000   # 문자열, 콤마 구분 (JSON 배열 아님)
```

## Auto Hooks

- **Pre-Tool-Use**: main 브랜치에서 Edit/Write 시 자동 차단
- **Post-Tool-Use**: `.py` → ruff format / `.ts .tsx` → prettier 자동 실행

## Skills & Commands

상세 개발 패턴은 `.claude/skills/`에 정의됨 (필요 시 자동 로드):

- `nextjs-patterns` — Next.js 14 App Router, 서버/클라이언트 컴포넌트 패턴
- `fastapi-patterns` — 3-Layer 구조, 라우터/서비스/DB 패턴, 에러 핸들링
- `supabase-patterns` — 마이그레이션, RLS, 쿼리 패턴
- `agent-development` — Claude API 연동, SSE 스트리밍, BaseAgent 패턴

커스텀 명령어 (`.claude/commands/`):

- `/new-api` — 새 API 엔드포인트 생성
- `/new-component` — 새 React 컴포넌트 생성
- `/new-migration` — 새 DB 마이그레이션 생성
- `/review` — 코드 리뷰 실행
