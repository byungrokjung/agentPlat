---
description: Supabase 마이그레이션 파일 생성
allowed-tools: Bash, Write, Read
---

# DB 마이그레이션 생성

**인자:** $ARGUMENTS (예: "create_agents", "add_user_settings", "update_executions")

## 실행 순서

### 1. 마이그레이션 파일 생성
```bash
supabase migration new $ARGUMENTS
```

### 2. SQL 작성
`supabase/migrations/{timestamp}_{name}.sql`

```sql
-- 테이블 생성 예시
CREATE TABLE {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- 필드 정의
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own {table_name}"
    ON {table_name} FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own {table_name}"
    ON {table_name} FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_{table_name}_user_id ON {table_name}(user_id);

-- updated_at 트리거
CREATE TRIGGER {table_name}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 3. 마이그레이션 실행
```bash
supabase db reset  # 로컬 DB 리셋 + 마이그레이션 적용
```

### 4. 타입 재생성
```bash
supabase gen types typescript --local > frontend/src/types/database.ts
```

## 체크리스트

- [ ] 마이그레이션 파일 생성
- [ ] SQL 작성 (테이블, RLS, 인덱스)
- [ ] 로컬에서 테스트
- [ ] TypeScript 타입 재생성
