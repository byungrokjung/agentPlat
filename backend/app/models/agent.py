from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    prompt: str = Field(..., min_length=10)
    model: str = "claude-sonnet-4-20250514"


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    prompt: str | None = None
    model: str | None = None


class Agent(AgentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentExecuteInput(BaseModel):
    user_input: str = Field(..., min_length=1)


class AgentExecuteOutput(BaseModel):
    result: str
    tokens_used: int = 0
    execution_time_ms: int = 0
