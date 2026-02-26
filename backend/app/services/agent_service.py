import time
from collections.abc import AsyncGenerator
from uuid import UUID

from app.models.agent import (
    Agent,
    AgentCreate,
    AgentExecuteInput,
    AgentExecuteOutput,
    AgentUpdate,
)
from app.services.claude_service import ClaudeService
from app.services.supabase import get_supabase


class AgentService:
    def __init__(self):
        self.claude = ClaudeService()

    async def list_agents(self, skip: int = 0, limit: int = 20) -> list[Agent]:
        """에이전트 목록 조회"""
        supabase = await get_supabase()
        response = (
            await supabase.table("agents")
            .select("*")
            .order("created_at", desc=True)
            .range(skip, skip + limit - 1)
            .execute()
        )
        return [self._to_agent(row) for row in response.data]

    async def get_agent(self, agent_id: UUID) -> Agent | None:
        """에이전트 단일 조회"""
        supabase = await get_supabase()
        response = (
            await supabase.table("agents")
            .select("*")
            .eq("id", str(agent_id))
            .single()
            .execute()
        )
        if response.data:
            return self._to_agent(response.data)
        return None

    async def create_agent(self, data: AgentCreate) -> Agent:
        """에이전트 생성"""
        supabase = await get_supabase()
        response = (
            await supabase.table("agents")
            .insert(
                {
                    "name": data.name,
                    "description": data.description,
                    "prompt": data.prompt,
                    "model": data.model,
                }
            )
            .execute()
        )
        return self._to_agent(response.data[0])

    async def update_agent(self, agent_id: UUID, data: AgentUpdate) -> Agent | None:
        """에이전트 수정"""
        supabase = await get_supabase()

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return await self.get_agent(agent_id)

        response = (
            await supabase.table("agents")
            .update(update_data)
            .eq("id", str(agent_id))
            .execute()
        )
        if response.data:
            return self._to_agent(response.data[0])
        return None

    async def delete_agent(self, agent_id: UUID) -> bool:
        """에이전트 삭제"""
        supabase = await get_supabase()
        response = (
            await supabase.table("agents").delete().eq("id", str(agent_id)).execute()
        )
        return len(response.data) > 0

    async def execute_agent(
        self, agent_id: UUID, input_data: AgentExecuteInput
    ) -> AgentExecuteOutput:
        """에이전트 실행 (비스트리밍)"""
        agent = await self.get_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        start_time = time.time()
        result = await self.claude.generate(
            prompt=input_data.user_input,
            system=agent.prompt,
            model=agent.model,
        )
        execution_time_ms = int((time.time() - start_time) * 1000)

        # 실행 이력 저장
        await self._save_execution(
            agent_id=agent_id,
            user_input=input_data.user_input,
            result=result,
            tokens_used=0,  # TODO: Claude API에서 토큰 수 가져오기
            execution_time_ms=execution_time_ms,
        )

        return AgentExecuteOutput(
            result=result,
            tokens_used=0,
            execution_time_ms=execution_time_ms,
        )

    async def execute_agent_stream(
        self, agent_id: UUID, input_data: AgentExecuteInput
    ) -> AsyncGenerator[str, None]:
        """에이전트 실행 (스트리밍)"""
        agent = await self.get_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        start_time = time.time()
        full_result = ""

        async for chunk in self.claude.stream(
            prompt=input_data.user_input,
            system=agent.prompt,
            model=agent.model,
        ):
            full_result += chunk
            yield chunk

        execution_time_ms = int((time.time() - start_time) * 1000)

        # 실행 이력 저장
        await self._save_execution(
            agent_id=agent_id,
            user_input=input_data.user_input,
            result=full_result,
            tokens_used=0,
            execution_time_ms=execution_time_ms,
        )

    async def get_executions(
        self, agent_id: UUID, skip: int = 0, limit: int = 20
    ) -> list[dict]:
        """에이전트 실행 이력 조회"""
        supabase = await get_supabase()
        response = (
            await supabase.table("agent_executions")
            .select("*")
            .eq("agent_id", str(agent_id))
            .order("created_at", desc=True)
            .range(skip, skip + limit - 1)
            .execute()
        )
        return response.data

    async def _save_execution(
        self,
        agent_id: UUID,
        user_input: str,
        result: str,
        tokens_used: int,
        execution_time_ms: int,
    ) -> None:
        """실행 이력 저장"""
        supabase = await get_supabase()
        await supabase.table("agent_executions").insert(
            {
                "agent_id": str(agent_id),
                "user_input": user_input,
                "result": result,
                "tokens_used": tokens_used,
                "execution_time_ms": execution_time_ms,
            }
        ).execute()

    def _to_agent(self, row: dict) -> Agent:
        """DB row를 Agent 모델로 변환"""
        return Agent(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            prompt=row["prompt"],
            model=row["model"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )


# 서비스 싱글톤
_agent_service: AgentService | None = None


def get_agent_service() -> AgentService:
    global _agent_service
    if _agent_service is None:
        _agent_service = AgentService()
    return _agent_service
