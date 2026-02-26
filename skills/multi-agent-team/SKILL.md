# Multi-Agent Team Skill

전문 에이전트 팀을 관리하고 조율하는 스킬

## 에이전트 구성

| 에이전트 | 역할 | 호출 |
|---------|------|------|
| Milo | 전략 리드, 팀 조율 | @milo |
| Josh | 비즈니스/분석 | @josh |
| Marketing | 마케팅/리서치 | @marketing |
| Dev | 개발/기술 | @dev |

## 트리거

- `/team status` - 팀 상태 확인
- `/team standup` - 스탠드업 미팅
- `@milo [질문]` - Milo에게 직접 질문
- `@dev [작업]` - Dev에게 작업 요청

## 공유 메모리

```
usecases/multi-agent-team/shared/
├── GOALS.md        # 팀 목표
├── DECISIONS.md    # 결정 로그
└── STATUS.md       # 프로젝트 상태
```

## 사용 예시

```
사용자: @milo 이번 주 우선순위 뭐야?
Milo: 이번 주 우선순위:
      1. MVP 백엔드 완성 (High)
      2. 프론트 대시보드 (Medium)
      ...

사용자: @dev API 설계 시작해줘
Dev: API 설계 시작합니다.
     - /api/agents - 에이전트 목록
     - /api/tasks - 작업 관리
     ...
```

## 자동 스케줄

- 08:00 - Milo 아침 스탠드업
- 18:00 - Milo 일일 리캡
- 09:00 - Josh 메트릭 리포트
