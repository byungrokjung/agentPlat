# Content Factory Skill

콘텐츠 자동 생성 파이프라인을 실행하는 스킬

## 트리거

다음 명령어로 실행:
- `/content [주제]`
- `콘텐츠 만들어줘 [주제]`
- `[주제]로 글 써줘`

## 파이프라인

```
1. Research Agent: 트렌드 분석 & 콘텐츠 기회 발굴
2. Writer Agent: 블로그/트위터 콘텐츠 작성
3. Thumbnail Agent: 이미지 프롬프트 생성
```

## 사용 예시

```
사용자: /content AI 에이전트
봇: 🏭 Content Factory 시작...
    📊 리서치 완료: 5개 기회 발견
    ✍️ 글 작성 완료: 블로그 + 트위터 스레드
    🎨 썸네일 프롬프트 생성 완료
    
    [결과 요약 + 파일 링크]
```

## 설정

환경 변수 필요:
- `ANTHROPIC_API_KEY`: Claude API 키

## 출력 위치

```
usecases/content-factory/output/
├── research/YYYY-MM-DD.md
├── writer/YYYY-MM-DD.md
└── thumbnail/YYYY-MM-DD.md
```
