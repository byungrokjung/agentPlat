---
name: fastapi-patterns
description: FastAPI 백엔드 개발 패턴. API 라우터, Pydantic 모델, 비동기 처리, 에러 핸들링 작성 시 사용.
---

# FastAPI Patterns

## 라우터 구조

```python
# app/api/v1/agents.py
from fastapi import APIRouter, HTTPException, Depends
from app.models.agent import Agent, AgentCreate, AgentUpdate
from app.services.agent_service import AgentService

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("", response_model=list[Agent])
async def get_agents(
    skip: int = 0,
    limit: int = 20,
    service: AgentService = Depends()
):
    return await service.get_all(skip=skip, limit=limit)

@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str, service: AgentService = Depends()):
    agent = await service.get_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("", response_model=Agent, status_code=201)
async def create_agent(data: AgentCreate, service: AgentService = Depends()):
    return await service.create(data)
```

## Pydantic 모델

```python
# app/models/agent.py
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    prompt: str = Field(..., min_length=10)

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    prompt: str | None = None

class Agent(AgentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## 서비스 레이어

```python
# app/services/agent_service.py
from supabase import AsyncClient
from app.models.agent import Agent, AgentCreate, AgentUpdate

class AgentService:
    def __init__(self, db: AsyncClient):
        self.db = db
        self.table = "agents"

    async def get_all(self, skip: int = 0, limit: int = 20) -> list[Agent]:
        response = await self.db.table(self.table)\
            .select("*")\
            .range(skip, skip + limit - 1)\
            .execute()
        return [Agent(**row) for row in response.data]

    async def get_by_id(self, agent_id: str) -> Agent | None:
        response = await self.db.table(self.table)\
            .select("*")\
            .eq("id", agent_id)\
            .single()\
            .execute()
        return Agent(**response.data) if response.data else None

    async def create(self, data: AgentCreate) -> Agent:
        response = await self.db.table(self.table)\
            .insert(data.model_dump())\
            .execute()
        return Agent(**response.data[0])
```

## 에러 핸들링

```python
# app/core/exceptions.py
from fastapi import Request
from fastapi.responses import JSONResponse

class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

# main.py에서 등록
app.add_exception_handler(AppException, app_exception_handler)
```

## Claude API 연동

```python
# app/services/claude_service.py
import anthropic
from app.core.config import settings

class ClaudeService:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate(self, prompt: str, system: str = "") -> str:
        message = await self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
```

## Anti-Patterns

❌ **동기 함수 사용**
```python
def get_agents():  # 동기 함수
    ...
```

✅ **비동기 함수 사용**
```python
async def get_agents():  # 비동기 함수
    ...
```

❌ **타입 힌트 없음**
```python
def create_agent(data):
    ...
```

✅ **타입 힌트 필수**
```python
async def create_agent(data: AgentCreate) -> Agent:
    ...
```
