---
description: 프로젝트 초기 설정 및 의존성 설치
allowed-tools: Bash, Write, Read
---

# 프로젝트 초기화

## 실행할 작업

1. **Frontend 설정**
   ```bash
   cd frontend
   pnpm install
   ```

2. **Backend 설정**
   ```bash
   cd backend
   uv sync
   ```

3. **환경 변수 파일 생성**
   - `frontend/.env.local` 템플릿 생성
   - `backend/.env` 템플릿 생성

4. **Supabase 로컬 시작** (설치되어 있다면)
   ```bash
   supabase start
   ```

5. **개발 서버 실행 안내**
   - Frontend: `cd frontend && pnpm dev`
   - Backend: `cd backend && uv run uvicorn main:app --reload`

## 완료 후 체크리스트

- [ ] 의존성 설치 완료
- [ ] 환경 변수 파일 생성됨
- [ ] Supabase 연결 확인
- [ ] 개발 서버 실행 가능
