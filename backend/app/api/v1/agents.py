from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.models.agent import (
    Agent,
    AgentCreate,
    AgentExecuteInput,
    AgentExecuteOutput,
    AgentUpdate,
)
from app.services.agent_service import get_agent_service

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[Agent])
async def get_agents(skip: int = 0, limit: int = 20):
    """에이전트 목록 조회"""
    service = get_agent_service()
    return await service.list_agents(skip=skip, limit=limit)


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: UUID):
    """에이전트 단일 조회"""
    service = get_agent_service()
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("", response_model=Agent, status_code=201)
async def create_agent(data: AgentCreate):
    """에이전트 생성"""
    service = get_agent_service()
    return await service.create_agent(data)


@router.patch("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: UUID, data: AgentUpdate):
    """에이전트 수정"""
    service = get_agent_service()
    agent = await service.update_agent(agent_id, data)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: UUID):
    """에이전트 삭제"""
    service = get_agent_service()
    deleted = await service.delete_agent(agent_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/execute", response_model=AgentExecuteOutput)
async def execute_agent(agent_id: UUID, input_data: AgentExecuteInput):
    """에이전트 실행 (비스트리밍)"""
    service = get_agent_service()
    try:
        return await service.execute_agent(agent_id, input_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{agent_id}/executions")
async def get_executions(agent_id: UUID, skip: int = 0, limit: int = 20):
    """에이전트 실행 이력 조회"""
    service = get_agent_service()
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return await service.get_executions(agent_id, skip=skip, limit=limit)


@router.post("/{agent_id}/execute/stream")
async def execute_agent_stream(agent_id: UUID, input_data: AgentExecuteInput):
    """에이전트 실행 (스트리밍 SSE)"""
    service = get_agent_service()
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    async def event_generator():
        try:
            async for chunk in service.execute_agent_stream(agent_id, input_data):
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
