---
name: nextjs-patterns
description: Next.js 14 App Router 패턴. 페이지, 컴포넌트, API 라우트, 서버 컴포넌트/클라이언트 컴포넌트 작성 시 사용.
---

# Next.js 14 Patterns

## App Router 구조

```
src/app/
├── layout.tsx           # 루트 레이아웃
├── page.tsx             # 홈페이지
├── loading.tsx          # 로딩 UI
├── error.tsx            # 에러 UI
├── agents/
│   ├── page.tsx         # /agents
│   ├── [id]/
│   │   └── page.tsx     # /agents/:id
│   └── new/
│       └── page.tsx     # /agents/new
└── api/                 # API Routes (필요 시)
```

## 서버 컴포넌트 (기본)

```tsx
// src/app/agents/page.tsx
import { AgentList } from '@/components/features/agent-list';
import { getAgents } from '@/lib/api/agents';

export default async function AgentsPage() {
  const agents = await getAgents();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI 에이전트</h1>
      <AgentList agents={agents} />
    </div>
  );
}
```

## 클라이언트 컴포넌트

```tsx
// src/components/features/agent-form.tsx
'use client';

import { useState } from 'react';
import { Button, Input, Textarea } from '@nextui-org/react';
import { createAgent } from '@/lib/api/agents';

interface AgentFormProps {
  onSuccess?: () => void;
}

export const AgentForm = ({ onSuccess }: AgentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      await createAgent({
        name: formData.get('name') as string,
        prompt: formData.get('prompt') as string,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        label="에이전트 이름"
        placeholder="예: 유튜브 대본 작성기"
        required
      />
      <Textarea
        name="prompt"
        label="시스템 프롬프트"
        placeholder="에이전트의 역할과 규칙을 입력하세요"
        minRows={4}
        required
      />
      {error && (
        <p className="text-danger text-sm">{error}</p>
      )}
      <Button type="submit" color="primary" isLoading={isLoading}>
        에이전트 생성
      </Button>
    </form>
  );
};
```

## API 클라이언트

```tsx
// src/lib/api/agents.ts
import { Agent, AgentCreate } from '@/types/agent';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_URL}/api/v1/agents`, {
    next: { revalidate: 60 }, // 60초 캐시
  });
  
  if (!res.ok) {
    throw new Error('에이전트 목록을 불러오는데 실패했습니다');
  }
  
  return res.json();
}

export async function getAgent(id: string): Promise<Agent> {
  const res = await fetch(`${API_URL}/api/v1/agents/${id}`, {
    next: { revalidate: 60 },
  });
  
  if (!res.ok) {
    throw new Error('에이전트를 찾을 수 없습니다');
  }
  
  return res.json();
}

export async function createAgent(data: AgentCreate): Promise<Agent> {
  const res = await fetch(`${API_URL}/api/v1/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '에이전트 생성에 실패했습니다');
  }
  
  return res.json();
}
```

## 로딩 상태

```tsx
// src/app/agents/loading.tsx
import { Spinner } from '@nextui-org/react';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );
}
```

## 에러 처리

```tsx
// src/app/agents/error.tsx
'use client';

import { Button } from '@nextui-org/react';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">문제가 발생했습니다</h2>
      <p className="text-gray-500">{error.message}</p>
      <Button color="primary" onPress={reset}>
        다시 시도
      </Button>
    </div>
  );
}
```

## NextUI 컴포넌트 활용

```tsx
// 카드 리스트
import { Card, CardHeader, CardBody, CardFooter, Button } from '@nextui-org/react';

export const AgentCard = ({ agent }: { agent: Agent }) => (
  <Card className="max-w-sm">
    <CardHeader className="flex gap-3">
      <div className="flex flex-col">
        <p className="text-md font-semibold">{agent.name}</p>
        <p className="text-small text-default-500">{agent.description}</p>
      </div>
    </CardHeader>
    <CardBody>
      <p className="text-sm line-clamp-3">{agent.prompt}</p>
    </CardBody>
    <CardFooter className="gap-2">
      <Button size="sm" color="primary">실행</Button>
      <Button size="sm" variant="bordered">수정</Button>
    </CardFooter>
  </Card>
);
```

## Anti-Patterns

❌ **클라이언트 컴포넌트에서 데이터 페칭**
```tsx
'use client';
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch(...) }, []); // ❌
}
```

✅ **서버 컴포넌트에서 데이터 페칭**
```tsx
export default async function Page() {
  const data = await fetchData(); // ✅
  return <ClientComponent data={data} />;
}
```

❌ **'use client' 남용**
```tsx
'use client'; // 불필요한 클라이언트 컴포넌트
export const StaticCard = () => <div>정적 콘텐츠</div>;
```

✅ **필요한 경우만 클라이언트 컴포넌트**
```tsx
// 상태, 이벤트 핸들러가 필요할 때만
'use client';
export const InteractiveButton = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};
```
