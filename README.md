# AI Agent Platform 🤖

> 사용자가 Claude API로 커스텀 AI 에이전트를 만들고 실행할 수 있는 플랫폼

[![Deploy](https://img.shields.io/badge/deploy-Railway-blueviolet)](https://railway.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com)

---

## ✨ 주요 기능

- 🎨 **커스텀 에이전트 생성** - 나만의 AI 에이전트 설계
- 💬 **실시간 대화** - SSE 스트리밍으로 즉각적인 응답
- 📊 **실행 기록** - 모든 대화 히스토리 저장
- 🔧 **유연한 설정** - 모델, 온도, 시스템 프롬프트 커스터마이징
- 🚀 **즉시 배포** - Railway로 원클릭 배포

---

## 🖥️ 데모

| 프로덕션 | URL |
|---------|-----|
| Frontend | [agentplat-production-cf45.up.railway.app](https://agentplat-production-cf45.up.railway.app) |
| Backend | [agentplat-production.up.railway.app](https://agentplat-production.up.railway.app) |

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|-----|------|
| **Frontend** | Next.js 14, Tailwind CSS, shadcn/ui, Zustand |
| **Backend** | FastAPI, Python 3.11+, Pydantic |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Claude API (Anthropic) |
| **배포** | Railway |
| **개발 도구** | Claude Code, MCP, pnpm, uv |

---

## 🚀 Quick Start

### 필수 조건

- Node.js 18+
- Python 3.11+
- pnpm
- uv
- Supabase CLI

### 1. 저장소 클론

```bash
git clone <repository-url>
cd ai-agent-platform
```

### 2. Frontend 설정

```bash
cd frontend
pnpm install
cp .env.local.example .env.local
# .env.local 편집
pnpm dev
```

### 3. Backend 설정

```bash
cd backend
uv sync
cp .env.example .env
# .env 편집 (API 키 입력)
uv run uvicorn main:app --reload
```

### 4. Database 설정

```bash
supabase start
supabase db reset
```

### 5. 접속

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Supabase Studio: http://localhost:54323

---

## 📁 프로젝트 구조

```
ai-agent-platform/
├── frontend/           # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/       # App Router
│   │   ├── components/# UI 컴포넌트
│   │   └── lib/       # 유틸리티
│   └── package.json
│
├── backend/            # FastAPI 백엔드
│   ├── app/
│   │   ├── api/       # API 라우터
│   │   ├── services/  # 비즈니스 로직
│   │   └── models/    # Pydantic 모델
│   └── main.py
│
├── supabase/           # DB 마이그레이션
├── docs/               # 문서
├── .claude/            # Claude Code 설정
│   ├── skills/        # 개발 패턴
│   ├── agents/        # 서브에이전트
│   └── commands/      # 커스텀 명령어
│
├── CLAUDE.md           # Claude Code 가이드
└── README.md           # 이 파일
```

---

## 📚 문서

| 문서 | 설명 |
|-----|------|
| [CLAUDE.md](./CLAUDE.md) | Claude Code 개발 가이드 |
| [docs/API.md](./docs/API.md) | API 엔드포인트 명세 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 시스템 아키텍처 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 기여 가이드 |

---

## ⚙️ 환경 변수

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ANTHROPIC_API_KEY=your_anthropic_key
CORS_ORIGINS=http://localhost:3000
```

---

## 🧪 테스트

```bash
# Backend
cd backend && uv run pytest -v

# Frontend
cd frontend && pnpm type-check && pnpm lint
```

---

## 🤝 기여하기

기여를 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해주세요.

---

## 📄 라이선스

MIT License

---

## 🙏 감사

- [Anthropic](https://anthropic.com) - Claude API
- [Vercel](https://vercel.com) - Next.js
- [Supabase](https://supabase.com) - Database
- [Railway](https://railway.app) - Deployment
