# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# AI Agent Platform

> AI 에이전트 빌더 플랫폼 MVP - 사용자가 Claude API로 커스텀 에이전트를 만들고 실행하는 플랫폼

## Tech Stack

| 항목 | 내용 |
|------|------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + NextUI |
| **Backend** | FastAPI (Python 3.11+) |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Claude API (Anthropic) |
| **Package Manager** | pnpm (frontend), uv (backend) |

---

## Architecture

### 프로젝트 구조

```
ai-agent-platform/
├── frontend/                 # Next.js 앱
│   ├── src/
│   │   ├── app/             # App Router 페이지
│   │   ├── components/      # React 컴포넌트
│   │   │   ├── ui/          # 공통 UI 컴포넌트 (NextUI 기반)
│   │   │   └── features/    # 기능별 컴포넌트 (에이전트 관련)
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── lib/             # 유틸리티, API 클라이언트
│   │   ├── stores/          # 상태 관리 (Zustand)
│   │   └── types/           # TypeScript 타입
│
├── backend/                  # FastAPI 앱
│   ├── app/
│   │   ├── api/v1/          # API 라우터 (버전별)
│   │   ├── core/            # 설정, 보안, 예외 처리
│   │   ├── models/          # Pydantic 모델
│   │   ├── services/        # 비즈니스 로직
│   │   │   └── agents/      # AI 에이전트 실행 로직
│   │   └── utils/           # 유틸리티
│   └── main.py              # 앱 진입점
│
├── supabase/                 # DB 스키마, 마이그레이션
│   └── migrations/
│
└── .claude/                  # Claude Code 설정
    ├── settings.json        # 권한, hooks, 환경변수
    ├── commands/            # 커스텀 명령어 (/new-api, /new-component 등)
    └── skills/              # 재사용 가능한 스킬
```

### 핵심 아키텍처 패턴

#### Frontend (Next.js 14 App Router)

- **서버 컴포넌트 우선**: 기본적으로 서버 컴포넌트 사용, 상태/이벤트 필요 시에만 'use client'
- **데이터 페칭**: 서버 컴포넌트에서 직접 fetch, 클라이언트 컴포넌트는 props로 받음
- **API 클라이언트**: `src/lib/api/` 에서 백엔드 API 호출 함수 정의
- **NextUI 컴포넌트**: Button, Card, Input, Modal 등 NextUI 활용

#### Backend (FastAPI)

- **3-Layer 구조**: Router → Service → Database
  - **Router**: API 엔드포인트 정의, 요청/응답 검증
  - **Service**: 비즈니스 로직 (에이전트 실행, Claude API 호출 등)
  - **Database**: Supabase 클라이언트로 DB 접근
- **비동기 처리**: 모든 I/O 작업은 `async/await` 사용
- **타입 안정성**: Pydantic 모델로 요청/응답 타입 정의

#### AI Agent System

- **동적 에이전트**: 사용자가 작성한 시스템 프롬프트를 DB에 저장하고 실행 시 Claude API로 전달
- **스트리밍 지원**: 실시간 응답을 위한 Server-Sent Events (SSE) 구현
- **BaseAgent 패턴**: `app/services/agents/base.py`에서 공통 인터페이스 정의

---

## Development Commands

### Frontend (Next.js)

```bash
cd frontend
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint 실행
pnpm type-check       # TypeScript 타입 검사
```

### Backend (FastAPI)

```bash
cd backend
uv sync               # 의존성 설치
uv run uvicorn main:app --reload  # 개발 서버 (localhost:8000)
uv run pytest         # 테스트 실행
uv run ruff check .   # 린트 검사
uv run ruff format .  # 코드 포맷팅
```

### Database (Supabase)

```bash
supabase start                    # 로컬 Supabase 시작
supabase db reset                 # DB 리셋 + 마이그레이션 적용
supabase migration new <name>     # 새 마이그레이션 생성
```

---

## API Conventions

### REST 엔드포인트

- URL: kebab-case (`/api/v1/ai-agents`)
- JSON 속성: camelCase (`agentId`, `createdAt`)
- 페이지네이션: `?page=1&limit=20`
- 에러 응답: `{ "error": { "code": "NOT_FOUND", "message": "..." } }`

### 예시

```
GET    /api/v1/agents              # 목록 조회
GET    /api/v1/agents/{id}         # 단일 조회
POST   /api/v1/agents              # 생성
PATCH  /api/v1/agents/{id}         # 수정
DELETE /api/v1/agents/{id}         # 삭제
POST   /api/v1/agents/{id}/execute # 에이전트 실행
```

---

## Database Schema

### 테이블 네이밍

- 테이블: `snake_case`, 복수형 (`ai_agents`, `agent_executions`)
- 컬럼: `snake_case` (`created_at`, `user_id`)
- Primary Key: `id` (UUID)
- Foreign Key: `{table}_id` (`user_id`, `agent_id`)

### 필수 컬럼

모든 테이블은 다음 컬럼을 포함해야 함:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

---

## Code Style

### TypeScript

- **Strict 모드** 필수
- `any` 금지 → `unknown` 사용
- `interface` 우선 (type보다)
- 파일명: kebab-case, 컴포넌트명: PascalCase

### Python

- **Type hints** 필수
- Pydantic 모델 사용
- `async/await` 패턴
- 파일명: snake_case, 클래스명: PascalCase

---

## Important Hooks (from .claude/settings.json)

### Pre-Tool-Use Hooks

- **main 브랜치 보호**: Edit/Write 시 main 브랜치인지 체크, main에서는 수정 차단
  - 에러 발생 시 새 브랜치를 만들어야 함

### Post-Tool-Use Hooks

- **자동 포맷팅**:
  - Python 파일 (`.py`): `ruff format` 자동 실행
  - TypeScript 파일 (`.ts`, `.tsx`): `prettier` 자동 실행

---

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Backend (.env)

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
CORS_ORIGINS=http://localhost:3000
```

---

## Related Claude Code Resources

이 프로젝트는 `.claude/skills/`에 재사용 가능한 스킬들이 정의되어 있습니다:

- **nextjs-patterns**: Next.js 14 App Router 패턴 (서버/클라이언트 컴포넌트, API 클라이언트)
- **fastapi-patterns**: FastAPI 백엔드 패턴 (라우터, 서비스, Pydantic 모델)
- **supabase-patterns**: Supabase DB 패턴 (마이그레이션, 쿼리)
- **agent-development**: AI 에이전트 개발 패턴 (Claude API 연동, 스트리밍)

`.claude/commands/`에는 자주 사용하는 작업을 위한 커스텀 명령어가 있습니다:

- **/new-api**: 새 API 엔드포인트 생성
- **/new-component**: 새 React 컴포넌트 생성
- **/new-migration**: 새 DB 마이그레이션 생성
- **/review**: 코드 리뷰 실행

---

## Critical Rules

1. **main 브랜치에 직접 커밋 금지** - hooks에서 자동으로 차단됨
2. **API 키, 시크릿 절대 커밋 금지** - `.env` 파일 사용
3. **`any` 타입 사용 금지** - TypeScript strict 모드
4. **타입 힌트 필수** - Python 모든 함수에 타입 정의
5. **DB 스키마 변경 시 마이그레이션 필수** - 직접 DB 수정 금지
