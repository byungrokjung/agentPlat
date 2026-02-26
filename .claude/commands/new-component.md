---
description: Next.js 컴포넌트 + 타입 생성
allowed-tools: Bash, Write, Read
---

# 새 컴포넌트 생성

**인자:** $ARGUMENTS (예: "AgentCard", "ExecutionHistory", "PromptEditor")

## 생성할 파일

### UI 컴포넌트 (features)
`frontend/src/components/features/{kebab-case}.tsx`

```tsx
'use client'; // 상태/이벤트 있으면 추가

import { ... } from '@nextui-org/react';

interface {Name}Props {
  // props 정의
}

export const {Name} = ({ ...props }: {Name}Props) => {
  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
};
```

### 공통 UI 컴포넌트
`frontend/src/components/ui/{kebab-case}.tsx`

## 규칙

1. **파일명**: kebab-case (`agent-card.tsx`)
2. **컴포넌트명**: PascalCase (`AgentCard`)
3. **Props 인터페이스**: `{Name}Props`
4. **Export**: Named export 사용

## 체크리스트

- [ ] 파일 생성
- [ ] Props 타입 정의
- [ ] NextUI 컴포넌트 활용
- [ ] 반응형 스타일링 (Tailwind)
- [ ] 'use client' 필요 여부 확인
