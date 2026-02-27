---
name: agent-development
description: AI 에이전트 개발 시 사용. Claude API 연동, SSE 스트리밍, 에이전트 실행 로직, BaseAgent 패턴 관련 작업에 자동 적용.
---

# AI Agent Development Patterns

## BaseAgent (app/services/agents/base.py)

```python
from abc import ABC, abstractmethod
from typing import AsyncGenerator
import anthropic

class BaseAgent(ABC):
    def __init__(self, system_prompt: str, model: str = "claude-sonnet-4-20250514"):
        self.system_prompt = system_prompt
        self.model = model
        self.client = anthropic.AsyncAnthropic()

    async def execute(self, user_message: str) -> str:
        """동기 실행 — 전체 응답을 한번에 반환"""
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=self.system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text

    async def execute_stream(self, user_message: str) -> AsyncGenerator[str, None]:
        """스트리밍 실행 — 토큰 단위로 yield"""
        async with self.client.messages.stream(
            model=self.model,
            max_tokens=4096,
            system=self.system_prompt,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            async for text in stream.text_stream:
                yield text

    @abstractmethod
    def get_system_prompt(self) -> str:
        """에이전트별 시스템 프롬프트 정의"""
        ...
```

## 동적 에이전트 실행 (DB에서 프롬프트 로드)

```python
# app/services/agents/dynamic_agent.py
from app.services.agents.base import BaseAgent
from app.core.supabase import get_supabase

class DynamicAgent(BaseAgent):
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        config = self._load_config()
        super().__init__(
            system_prompt=config["system_prompt"],
            model=config["model"],
        )

    def _load_config(self) -> dict:
        supabase = get_supabase()
        result = supabase.table("ai_agents") \
            .select("system_prompt, model") \
            .eq("id", self.agent_id) \
            .single() \
            .execute()

        if not result.data:
            raise ValueError(f"Agent {self.agent_id} not found")

        return result.data

    def get_system_prompt(self) -> str:
        return self.system_prompt
```

## SSE 스트리밍 엔드포인트

```python
# app/api/v1/agents.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.agents.dynamic_agent import DynamicAgent
from app.models.agent import ExecuteRequest

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])

@router.post("/{agent_id}/execute")
async def execute_agent(agent_id: str, body: ExecuteRequest):
    agent = DynamicAgent(agent_id)

    if body.stream:
        return StreamingResponse(
            _stream_response(agent, body.message),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    result = await agent.execute(body.message)
    return {"result": result}

async def _stream_response(agent: DynamicAgent, message: str):
    """SSE 포맷으로 스트리밍"""
    try:
        async for chunk in agent.execute_stream(message):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"event: error\ndata: {str(e)}\n\n"
```

## 프론트엔드 SSE 수신

```typescript
// lib/api/agents.ts
export async function executeAgentStream(
  agentId: string,
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/agents/${agentId}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, stream: true }),
  });

  if (!res.ok || !res.body) {
    onError("Stream connection failed");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") {
          onDone();
          return;
        }
        onChunk(data);
      }
      if (line.startsWith("event: error")) {
        onError("Stream error occurred");
        return;
      }
    }
  }
}
```

## 실행 기록 저장

```sql
-- supabase/migrations/xxx_create_agent_executions.sql
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_message TEXT NOT NULL,
  output_message TEXT,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_user_id ON agent_executions(user_id);
```

## 규칙 요약

- 모든 에이전트는 BaseAgent를 상속
- Claude API 호출은 반드시 async 사용
- 스트리밍은 SSE 포맷 (data: ...\n\n)
- 실행 기록은 agent_executions 테이블에 저장
- 에러 발생 시 SSE event: error로 클라이언트에 전달
