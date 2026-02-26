import anthropic

from app.core.config import settings


class ClaudeService:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate(
        self,
        prompt: str,
        system: str = "",
        model: str | None = None,
        max_tokens: int | None = None,
        temperature: float = 0.7,
    ) -> str:
        """Claude API로 텍스트 생성"""
        message = await self.client.messages.create(
            model=model or settings.CLAUDE_MODEL,
            max_tokens=max_tokens or settings.CLAUDE_MAX_TOKENS,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    async def stream(
        self,
        prompt: str,
        system: str = "",
        model: str | None = None,
    ):
        """Claude API 스트리밍 응답"""
        async with self.client.messages.stream(
            model=model or settings.CLAUDE_MODEL,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield text
