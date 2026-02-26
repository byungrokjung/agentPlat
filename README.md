# AI Agent Platform

> 사용자가 Claude API로 커스텀 AI 에이전트를 만들고 실행할 수 있는 플랫폼

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm
- uv
- Supabase CLI

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-agent-platform
   ```

2. **Frontend setup**
   ```bash
   cd frontend
   pnpm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   pnpm dev
   ```

3. **Backend setup**
   ```bash
   cd backend
   uv sync
   cp .env.example .env
   # Edit .env with your API keys
   uv run uvicorn main:app --reload
   ```

4. **Database setup**
   ```bash
   supabase start
   supabase db reset
   ```

## 📚 Documentation

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, NextUI
- **Backend**: FastAPI, Python 3.11+
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
