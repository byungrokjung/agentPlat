---
name: supabase-patterns
description: Supabase 데이터베이스 작업 시 사용. 테이블 생성, 마이그레이션, RLS 정책, 쿼리 패턴 관련 작업에 자동 적용.
---

# Supabase Database Patterns

## 마이그레이션 생성

```bash
supabase migration new create_ai_agents
```

### 테이블 생성 예시

```sql
-- supabase/migrations/20240101000000_create_ai_agents.sql

CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model VARCHAR(50) NOT NULL DEFAULT 'claude-sonnet-4-20250514',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_ai_agents_user_id ON ai_agents(user_id);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ai_agents_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### RLS (Row Level Security)

```sql
-- RLS 활성화
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- 자신의 에이전트만 조회
CREATE POLICY "users_select_own_agents" ON ai_agents
  FOR SELECT USING (auth.uid() = user_id);

-- 자신의 에이전트만 생성
CREATE POLICY "users_insert_own_agents" ON ai_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 자신의 에이전트만 수정
CREATE POLICY "users_update_own_agents" ON ai_agents
  FOR UPDATE USING (auth.uid() = user_id);

-- 자신의 에이전트만 삭제
CREATE POLICY "users_delete_own_agents" ON ai_agents
  FOR DELETE USING (auth.uid() = user_id);
```

## Python 클라이언트 (backend)

### 초기화 (app/core/supabase.py)

```python
import os
from supabase import create_client, Client

_client: Client | None = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_SERVICE_KEY", "")
        )
    return _client
```

### 쿼리 패턴

```python
supabase = get_supabase()

# 목록 조회 (페이지네이션)
result = supabase.table("ai_agents") \
    .select("*") \
    .eq("user_id", user_id) \
    .order("created_at", desc=True) \
    .range(offset, offset + limit - 1) \
    .execute()

# 단일 조회
result = supabase.table("ai_agents") \
    .select("*") \
    .eq("id", agent_id) \
    .single() \
    .execute()

# 생성
result = supabase.table("ai_agents") \
    .insert({"name": "My Agent", "system_prompt": "...", "user_id": user_id}) \
    .execute()

# 수정
result = supabase.table("ai_agents") \
    .update({"name": "Updated Name"}) \
    .eq("id", agent_id) \
    .execute()

# 삭제
result = supabase.table("ai_agents") \
    .delete() \
    .eq("id", agent_id) \
    .execute()
```

## 규칙 요약

- 테이블: snake_case 복수형, 필수 컬럼 (`id`, `created_at`, `updated_at`) 포함
- PK: UUID + gen_random_uuid()
- FK: ON DELETE CASCADE 기본
- RLS: 모든 테이블에 필수 활성화
- 스키마 변경은 반드시 마이그레이션으로 (직접 DB 수정 금지)
- Backend에서는 service_key로 접근 (RLS 바이패스)
