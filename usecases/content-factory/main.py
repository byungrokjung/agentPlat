"""
Content Factory - 멀티 에이전트 콘텐츠 파이프라인
Research → Writing → Thumbnail 자동화
"""

import os
import asyncio
from datetime import datetime
from pathlib import Path

import anthropic
from dotenv import load_dotenv


# 환경 변수 로드
load_dotenv("config/.env")

CLIENT = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
TODAY = datetime.now().strftime("%Y-%m-%d")


def load_soul(agent_name: str) -> str:
    """에이전트 SOUL.md 로드"""
    path = Path(f"agents/{agent_name}/SOUL.md")
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""


def save_output(agent_name: str, content: str) -> str:
    """에이전트 출력 저장"""
    output_dir = Path(f"output/{agent_name}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    filepath = output_dir / f"{TODAY}.md"
    filepath.write_text(content, encoding="utf-8")
    return str(filepath)


def run_agent(agent_name: str, model: str, prompt: str, context: str = "") -> str:
    """에이전트 실행"""
    soul = load_soul(agent_name)
    
    system_prompt = f"{soul}\n\n오늘 날짜: {TODAY}"
    if context:
        system_prompt += f"\n\n이전 에이전트 출력:\n{context}"
    
    print(f"\n🤖 [{agent_name.upper()}] 실행 중...")
    
    response = CLIENT.messages.create(
        model=model,
        max_tokens=4000,
        system=system_prompt,
        messages=[{"role": "user", "content": prompt}]
    )
    
    result = response.content[0].text
    filepath = save_output(agent_name, result)
    print(f"✅ [{agent_name.upper()}] 완료 → {filepath}")
    
    return result


def run_pipeline(topic: str = None):
    """전체 파이프라인 실행"""
    print("=" * 50)
    print(f"🏭 Content Factory 시작 - {TODAY}")
    print("=" * 50)
    
    # 1. Research Agent
    research_prompt = """
    오늘의 트렌드를 분석하고 top 5 콘텐츠 기회를 찾아줘.
    - 테크/AI 뉴스
    - 소셜 미디어 트렌드
    - 바이럴 콘텐츠 분석
    
    형식에 맞춰 출력해줘.
    """
    if topic:
        research_prompt = f"'{topic}' 주제로 콘텐츠 기회를 찾아줘.\n" + research_prompt
    
    research_result = run_agent(
        "research",
        "claude-sonnet-4-20250514",
        research_prompt
    )
    
    # 2. Writing Agent
    writing_prompt = """
    Research Agent가 찾은 top 1 아이디어로 콘텐츠를 작성해줘.
    
    다음 두 가지 버전으로:
    1. 블로그 포스트 (800-1000자)
    2. 트위터 스레드 (5-7개 트윗)
    """
    
    writing_result = run_agent(
        "writer",
        "claude-sonnet-4-20250514",
        writing_prompt,
        context=research_result
    )
    
    # 3. Thumbnail Agent
    thumbnail_prompt = """
    작성된 콘텐츠에 맞는 썸네일 이미지 프롬프트를 만들어줘.
    
    - DALL-E / Midjourney 스타일 프롬프트
    - 플랫폼별 사이즈 가이드
    - 컬러/무드 제안
    """
    
    thumbnail_result = run_agent(
        "thumbnail",
        "claude-sonnet-4-20250514",
        thumbnail_prompt,
        context=writing_result
    )
    
    print("\n" + "=" * 50)
    print("🎉 Content Factory 완료!")
    print(f"📁 결과물: output/ 폴더 확인")
    print("=" * 50)
    
    return {
        "research": research_result,
        "writing": writing_result,
        "thumbnail": thumbnail_result
    }


if __name__ == "__main__":
    import sys
    
    topic = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else None
    run_pipeline(topic)
