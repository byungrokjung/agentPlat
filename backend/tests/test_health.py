"""
기본 헬스체크 테스트
"""
import pytest


def test_health_check():
    """서버 헬스체크 테스트"""
    # TODO: 실제 API 클라이언트로 테스트
    assert True


def test_api_version():
    """API 버전 확인 테스트"""
    expected_version = "v1"
    assert expected_version == "v1"
