---
name: agent-development
description: AI 에이전트 개발 패턴. Claude API 연동, 프롬프트 설계, 에이전트 실행 로직 작성 시 사용.
---

# AI Agent Development Patterns

## 에이전트 구조

```python
# app/services/agents/base.py
from abc import ABC, abstractmethod
from pydantic import BaseModel

class AgentInput(BaseModel):
    user_input: str
    context: dict = {}

class AgentOutput(BaseModel):
    result: str
    tokens_used: int
    execution_time_ms: int

class BaseAgent(ABC):
    def __init__(self, claude_service: ClaudeService):
        self.claude = claude_service

    @abstractmethod
    def get_system_prompt(self) -> str:
        pass

    async def execute(self, input: AgentInput) -> AgentOutput:
        import time
        start = time.time()
        
        result = await self.claude.generate(
            prompt=input.user_input,
            system=self.get_system_prompt()
        )
        
        execution_time = int((time.time() - start) * 1000)
        
        return AgentOutput(
            result=result,
            tokens_used=0,  # TODO: 실제 토큰 수 계산
            execution_time_ms=execution_time
        )
```

## 유튜브 대본 에이전트 예시

```python
# app/services/agents/youtube_script_agent.py
from app.services.agents.base import BaseAgent, AgentInput, AgentOutput

class YouTubeScriptAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
당신은 유튜브 대본 작성 전문가입니다.

## 대본 구조
1. 훅 (0-30초): 충격적 질문이나 통계로 시작
2. 본론: SEAC 공식 적용 (Story-Explain-Apply-Connect)
3. CTA: 자연스러운 구독/좋아요 유도

## 말투 규칙
- 친근한 존댓말 (~에요, ~죠, ~거예요)
- 구어체 활용 (그러나 → 근데요)
- 청자 참여 유도 ("혹시 이런 경험 있으신가요?")

## 출력 형식
JSON 형태로 출력:
{
  "script": "대본 전문",
  "storyboard": [
    {"scene": 1, "title": "훅", "duration": "0:00-0:30", "visual": "..."}
  ],
  "thumbnail_ideas": ["아이디어1", "아이디어2"]
}
"""

    async def generate_script(self, topic: str, style: str = "자기계발") -> AgentOutput:
        input = AgentInput(
            user_input=f"주제: {topic}\n스타일: {style}\n\n위 주제로 8-10분 분량의 유튜브 대본을 작성해주세요.",
            context={"style": style}
        )
        return await self.execute(input)
```

## 동적 에이전트 실행

```python
# app/services/agent_executor.py
from app.models.agent import Agent
from app.services.claude_service import ClaudeService

class AgentExecutor:
    def __init__(self, claude_service: ClaudeService):
        self.claude = claude_service

    async def execute(self, agent: Agent, user_input: str) -> str:
        """저장된 에이전트 설정으로 실행"""
        return await self.claude.generate(
            prompt=user_input,
            system=agent.prompt,
            model=agent.model
        )
```

## Claude API 고급 사용

```python
# app/services/claude_service.py
import anthropic
from typing import AsyncIterator

class ClaudeService:
    def __init__(self, api_key: str):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    async def generate(
        self,
        prompt: str,
        system: str = "",
        model: str = "claude-sonnet-4-20250514",
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> str:
        message = await self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text

    async def stream(
        self,
        prompt: str,
        system: str = "",
        model: str = "claude-sonnet-4-20250514"
    ) -> AsyncIterator[str]:
        """스트리밍 응답"""
        async with self.client.messages.stream(
            model=model,
            max_tokens=4096,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            async for text in stream.text_stream:
                yield text
```

## 스트리밍 API 엔드포인트

```python
# app/api/v1/agents.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/{agent_id}/execute/stream")
async def execute_agent_stream(
    agent_id: str,
    input: AgentExecuteInput,
    agent_service: AgentService = Depends(),
    claude_service: ClaudeService = Depends()
):
    agent = await agent_service.get_by_id(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")

    async def generate():
        async for chunk in claude_service.stream(
            prompt=input.user_input,
            system=agent.prompt
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

## 프론트엔드 스트리밍 처리

```typescript
// src/lib/api/agents.ts
export async function executeAgentStream(
  agentId: string,
  input: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/v1/agents/${agentId}/execute/stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: input }),
    }
  );

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        onChunk(line.slice(6));
      }
    }
  }
}
```

## 프롬프트 템플릿 관리

```python
# app/services/prompt_templates.py
from string import Template

TEMPLATES = {
    "youtube_script": Template("""
주제: $topic
스타일: $style
목표 길이: $length분

위 조건에 맞는 유튜브 대본을 작성해주세요.
"""),
    "content_summary": Template("""
다음 콘텐츠를 $style 스타일로 요약해주세요:

$content
"""),
}

def render_prompt(template_name: str, **kwargs) -> str:
    template = TEMPLATES.get(template_name)
    if not template:
        raise ValueError(f"Unknown template: {template_name}")
    return template.safe_substitute(**kwargs)
```

## Anti-Patterns

❌ **API 키 하드코딩**
```python
client = anthropic.Anthropic(api_key="sk-ant-...")
```

✅ **환경 변수 사용**
```python
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
```

❌ **에러 처리 없이 API 호출**
```python
result = await client.messages.create(...)
```

✅ **적절한 에러 처리**
```python
try:
    result = await client.messages.create(...)
except anthropic.APIError as e:
    logger.error(f"Claude API error: {e}")
    raise HTTPException(502, "AI 서비스 오류")
```
