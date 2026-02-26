---
description: FastAPI 엔드포인트 + Pydantic 모델 + 서비스 레이어 생성
allowed-tools: Bash, Write, Read, Grep
---

# 새 API 엔드포인트 생성

**인자:** $ARGUMENTS (예: "agents", "executions", "templates")

## 생성할 파일들

### 1. Pydantic 모델
`backend/app/models/{name}.py`
```python
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class {Name}Base(BaseModel):
    # 기본 필드 정의

class {Name}Create({Name}Base):
    pass

class {Name}Update(BaseModel):
    # Optional 필드들

class {Name}({Name}Base):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 2. 서비스 레이어
`backend/app/services/{name}_service.py`
```python
class {Name}Service:
    async def get_all(self, skip: int = 0, limit: int = 20):
        ...
    async def get_by_id(self, id: str):
        ...
    async def create(self, data):
        ...
    async def update(self, id: str, data):
        ...
    async def delete(self, id: str):
        ...
```

### 3. API 라우터
`backend/app/api/v1/{name}.py`
```python
router = APIRouter(prefix="/{name}s", tags=["{name}s"])

@router.get("")
@router.get("/{id}")
@router.post("")
@router.put("/{id}")
@router.delete("/{id}")
```

### 4. 라우터 등록
`backend/app/api/v1/__init__.py`에 라우터 추가

## 체크리스트

- [ ] 모델 생성
- [ ] 서비스 생성
- [ ] 라우터 생성
- [ ] 라우터 등록
- [ ] 타입 힌트 확인
- [ ] 에러 핸들링 확인
