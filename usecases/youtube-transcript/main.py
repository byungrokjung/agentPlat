"""
YouTube Transcript Extractor
유튜브 영상에서 자막/대본 추출
"""

import sys
import re
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    """유튜브 URL에서 영상 ID 추출"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'^([a-zA-Z0-9_-]{11})$'  # 직접 ID 입력
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"유효한 유튜브 URL이 아닙니다: {url}")


def get_transcript(video_id: str, languages: list = ['ko', 'en']) -> str:
    """자막 가져오기"""
    ytt_api = YouTubeTranscriptApi()
    
    try:
        transcript = ytt_api.fetch(video_id, languages=languages)
    except Exception:
        # 자동 생성 자막 시도
        transcript = ytt_api.fetch(video_id)
    
    # 텍스트만 추출
    text = "\n".join([t.text for t in transcript])
    return text


def save_transcript(text: str, video_id: str, output_dir: str = "output"):
    """대본 저장"""
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    filepath = f"{output_dir}/{video_id}.md"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# YouTube Transcript: {video_id}\n\n")
        f.write(text)
    
    return filepath


def main():
    if len(sys.argv) < 2:
        print("사용법: python main.py <유튜브URL>")
        print("예시: python main.py https://youtu.be/2WJzwwvzbBQ")
        sys.exit(1)
    
    url = sys.argv[1]
    save = "--save" in sys.argv
    
    try:
        video_id = extract_video_id(url)
        print(f"📺 영상 ID: {video_id}")
        print("🔄 자막 추출 중...")
        
        text = get_transcript(video_id)
        
        if save:
            filepath = save_transcript(text, video_id)
            print(f"✅ 저장됨: {filepath}")
        else:
            print("\n" + "="*50)
            print(text)
            print("="*50)
            print(f"\n📝 총 {len(text)} 글자")
            print("💡 파일로 저장하려면: python main.py <URL> --save")
    
    except Exception as e:
        print(f"❌ 에러: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
