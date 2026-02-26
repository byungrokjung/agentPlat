# 📺 YouTube Transcript Extractor

유튜브 영상에서 자막/대본 추출

## 설치

```bash
cd usecases/youtube-transcript
uv sync
```

## 사용법

```bash
# 화면에 출력
uv run python main.py "https://youtu.be/2WJzwwvzbBQ"

# 파일로 저장
uv run python main.py "https://youtu.be/2WJzwwvzbBQ" --save
```

## 출력

```
output/
└── {video_id}.md
```

## 지원 형식

- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `VIDEO_ID` (직접 입력)
