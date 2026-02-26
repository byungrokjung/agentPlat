---
name: supabase-patterns
description: Supabase 데이터베이스 패턴. 테이블 설계, 마이그레이션, RLS 정책, 쿼리 작성 시 사용.
---

# Supabase Patterns

## 테이블 설계

```sql
-- supabase/migrations/001_create_agents.sql

-- 에이전트 테이블
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    model VARCHAR(50) DEFAULT 'claude-sonnet-4-20250514',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 에이전트 실행 기록
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    output TEXT,
    tokens_used INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 인덱스
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_user_id ON agent_executions(user_id);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at DESC);
```

## Row Level Security (RLS)

```sql
-- RLS 활성화
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- 에이전트: 본인 것만 접근
CREATE POLICY "Users can view own agents"
    ON agents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
    ON agents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
    ON agents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
    ON agents FOR DELETE
    USING (auth.uid() = user_id);

-- 실행 기록: 본인 것만 접근
CREATE POLICY "Users can view own executions"
    ON agent_executions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executions"
    ON agent_executions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

## Python 클라이언트 (Backend)

```python
# app/core/database.py
from supabase import create_client, AsyncClient
from app.core.config import settings

def get_supabase() -> AsyncClient:
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY  # 서버에서는 service key 사용
    )

# 의존성 주입
async def get_db():
    return get_supabase()
```

```python
# app/services/agent_service.py
class AgentService:
    def __init__(self, db: AsyncClient = Depends(get_db)):
        self.db = db

    async def get_user_agents(self, user_id: str) -> list[Agent]:
        response = await self.db.table("agents")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("is_active", True)\
            .order("created_at", desc=True)\
            .execute()
        return [Agent(**row) for row in response.data]

    async def create_agent(self, user_id: str, data: AgentCreate) -> Agent:
        response = await self.db.table("agents")\
            .insert({
                "user_id": user_id,
                **data.model_dump()
            })\
            .execute()
        return Agent(**response.data[0])

    async def update_agent(self, agent_id: str, data: AgentUpdate) -> Agent:
        response = await self.db.table("agents")\
            .update(data.model_dump(exclude_unset=True))\
            .eq("id", agent_id)\
            .execute()
        return Agent(**response.data[0])

    async def delete_agent(self, agent_id: str) -> None:
        await self.db.table("agents")\
            .delete()\
            .eq("id", agent_id)\
            .execute()
```

## TypeScript 클라이언트 (Frontend)

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
```

## 타입 생성

```bash
# Supabase 타입 자동 생성
supabase gen types typescript --local > src/types/database.ts
```

```typescript
// src/types/database.ts (자동 생성됨)
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          prompt: string;
          model: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { ... };
        Update: { ... };
      };
    };
  };
}
```

## Anti-Patterns

❌ **클라이언트에서 service key 사용**
```typescript
// 절대 금지! service key는 모든 RLS 우회
const supabase = createClient(url, SERVICE_KEY);
```

✅ **클라이언트는 anon key만 사용**
```typescript
const supabase = createClient(url, ANON_KEY);
```

❌ **RLS 없이 테이블 공개**
```sql
-- 위험! 모든 사용자가 모든 데이터 접근 가능
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
```

✅ **항상 RLS 활성화**
```sql
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- 적절한 정책 설정
```
