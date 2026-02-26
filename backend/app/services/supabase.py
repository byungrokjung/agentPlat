from functools import lru_cache

from supabase import AsyncClient, acreate_client

from app.core.config import settings


@lru_cache
def get_supabase_url() -> str:
    return settings.SUPABASE_URL


@lru_cache
def get_supabase_key() -> str:
    return settings.SUPABASE_SERVICE_KEY


_client: AsyncClient | None = None


async def get_supabase() -> AsyncClient:
    """Supabase 비동기 클라이언트 싱글톤 반환"""
    global _client
    if _client is None:
        _client = await acreate_client(
            get_supabase_url(),
            get_supabase_key(),
        )
    return _client


async def close_supabase() -> None:
    """Supabase 클라이언트 연결 종료"""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
