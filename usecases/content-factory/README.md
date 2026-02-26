# 🏭 Content Factory

멀티 에이전트 콘텐츠 자동 생성 파이프라인

## 구조

```
Research Agent → Writing Agent → Thumbnail Agent
   (리서치)         (글쓰기)        (이미지)
```

## 에이전트

| Agent | 역할 | 모델 |
|-------|------|------|
| Research | 트렌드 분석, 콘텐츠 기회 발굴 | Sonnet |
| Writer | 블로그/트위터 콘텐츠 작성 | Sonnet |
| Thumbnail | 이미지 프롬프트 생성 | Sonnet |

## 설치

```bash
cd content-factory
cp config/.env.example config/.env
# .env에 ANTHROPIC_API_KEY 설정

uv sync  # 또는 pip install -e .
```

## 실행

```bash
# 기본 실행 (자동 트렌드 분석)
uv run python main.py

# 특정 주제로 실행
uv run python main.py "AI 에이전트"
```

## 출력

```
output/
├── research/2024-02-26.md    # 리서치 결과
├── scripts/2024-02-26.md     # 작성된 콘텐츠
└── thumbnails/2024-02-26.md  # 썸네일 프롬프트
```

## 자동화 (Cron)

매일 아침 8시 자동 실행:
```bash
0 8 * * * cd ~/projects/content-factory && uv run python main.py
```
