# API 문서

> AI Agent Platform REST API 명세

## Base URL

| 환경 | URL |
|-----|-----|
| 로컬 | `http://localhost:8000` |
| 프로덕션 | `https://agentplat-production.up.railway.app` |

---

## 인증

모든 API 요청에 Bearer 토큰 필요:

```
Authorization: Bearer <token>
```

---

## 엔드포인트

### 헬스체크

#### GET /health
서버 상태 확인

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### 에이전트

#### GET /api/v1/agents
에이전트 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| page | int | 페이지 번호 (기본: 1) |
| limit | int | 페이지 크기 (기본: 20) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "에이전트 이름",
      "description": "설명",
      "systemPrompt": "시스템 프롬프트",
      "createdAt": "2026-02-28T12:00:00Z",
      "updatedAt": "2026-02-28T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

#### POST /api/v1/agents
에이전트 생성

**Request Body:**
```json
{
  "name": "에이전트 이름",
  "description": "설명",
  "systemPrompt": "시스템 프롬프트",
  "model": "claude-3-opus-20240229",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "에이전트 이름",
  "createdAt": "2026-02-28T12:00:00Z"
}
```

---

#### GET /api/v1/agents/{id}
특정 에이전트 조회

**Response:**
```json
{
  "id": "uuid",
  "name": "에이전트 이름",
  "description": "설명",
  "systemPrompt": "시스템 프롬프트",
  "model": "claude-3-opus-20240229",
  "temperature": 0.7,
  "createdAt": "2026-02-28T12:00:00Z",
  "updatedAt": "2026-02-28T12:00:00Z"
}
```

---

#### PUT /api/v1/agents/{id}
에이전트 수정

**Request Body:**
```json
{
  "name": "수정된 이름",
  "description": "수정된 설명"
}
```

---

#### DELETE /api/v1/agents/{id}
에이전트 삭제

**Response:**
```json
{
  "message": "에이전트가 삭제되었습니다."
}
```

---

### 에이전트 실행

#### POST /api/v1/agents/{id}/execute
에이전트 실행 (SSE 스트리밍)

**Request Body:**
```json
{
  "message": "사용자 메시지",
  "conversationId": "대화 ID (선택)"
}
```

**Response (SSE):**
```
data: {"type": "text", "content": "응답 텍스트..."}
data: {"type": "text", "content": "계속..."}
data: {"type": "done", "usage": {"inputTokens": 100, "outputTokens": 200}}
```

---

## 에러 응답

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "에이전트를 찾을 수 없습니다."
  }
}
```

| 코드 | HTTP | 설명 |
|-----|------|------|
| BAD_REQUEST | 400 | 잘못된 요청 |
| UNAUTHORIZED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 권한 없음 |
| NOT_FOUND | 404 | 리소스 없음 |
| INTERNAL_ERROR | 500 | 서버 에러 |

---

## Rate Limiting

- 분당 60 요청
- 초과 시 `429 Too Many Requests` 반환
