---
name: fastapi-patterns
description: FastAPI 백엔드 개발 시 사용. API 엔드포인트 생성, 서비스 로직, Pydantic 모델, 에러 핸들링 관련 작업에 자동 적용.
---

# FastAPI Backend Patterns

## 3-Layer Architecture

모든 백엔드 코드는 Router → Service → Database 구조를 따른다.

### Router (app/api/v1/)

```python
from fastapi import APIRouter, HTTPException, Depends
from app.models.agent import CreateAgentRequest, AgentResponse, AgentListResponse
from app.services import agent_service

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])

@router.get("", response_model=AgentListResponse)
async def list_agents(page: int = 1, limit: int = 20):
    return await agent_service.get_list(page=page, limit=limit)

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    result = await agent_service.get_by_id(agent_id)
    if not result:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Agent not found"})
    return result

@router.post("", response_model=AgentResponse, status_code=201)
async def create_agent(body: CreateAgentRequest):
    return await agent_service.create(body)

@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: str, body: UpdateAgentRequest):
    return await agent_service.update(agent_id, body)

@router.delete("/{agent_id}", status_code=204)
async def delete_agent(agent_id: str):
    await agent_service.delete(agent_id)
```

### Service (app/services/)

```python
from app.core.supabase import get_supabase
from app.core.exceptions import NotFoundError, ValidationError
from app.models.agent import CreateAgentRequest, AgentResponse

async def create(data: CreateAgentRequest) -> AgentResponse:
    supabase = get_supabase()
    result = supabase.table("ai_agents").insert(data.model_dump()).execute()

    if not result.data:
        raise ValidationError("Failed to create agent")

    return AgentResponse(**result.data[0])

async def get_by_id(agent_id: str) -> AgentResponse | None:
    supabase = get_supabase()
    result = supabase.table("ai_agents").select("*").eq("id", agent_id).single().execute()

    if not result.data:
        return None

    return AgentResponse(**result.data)
```

### Pydantic Models (app/models/)

```python
from pydantic import BaseModel, Field
from datetime import datetime

class CreateAgentRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    system_prompt: str = Field(..., min_length=1)
    model: str = "claude-sonnet-4-20250514"

class AgentResponse(BaseModel):
    id: str
    name: str
    description: str | None
    system_prompt: str
    model: str
    created_at: datetime
    updated_at: datetime

    class Config:
        # DB snake_case → API camelCase 변환
        alias_generator = lambda s: "".join(
            w.capitalize() if i else w for i, w in enumerate(s.split("_"))
        )
        populate_by_name = True
```

## Error Handling

### 커스텀 예외 (app/core/exceptions.py)

```python
from fastapi import HTTPException

class AppError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message}
        )

class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(404, "NOT_FOUND", message)

class ValidationError(AppError):
    def __init__(self, message: str = "Validation failed"):
        super().__init__(422, "VALIDATION_ERROR", message)

class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(401, "UNAUTHORIZED", message)
```

### 에러 응답 포맷

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Agent with id 'xxx' not found"
  }
}
```

## CORS 설정 (main.py)

```python
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 규칙 요약

- 모든 함수에 타입 힌트 필수
- 모든 I/O는 async/await
- 요청/응답은 반드시 Pydantic 모델 사용
- 에러는 커스텀 예외 클래스 사용
- Router에는 비즈니스 로직 금지 (Service에 위임)
