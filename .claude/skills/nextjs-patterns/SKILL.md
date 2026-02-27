---
name: nextjs-patterns
description: Next.js 14 App Router 프론트엔드 개발 시 사용. 페이지, 컴포넌트, API 클라이언트, 상태 관리 관련 작업에 자동 적용.
---

# Next.js 14 Frontend Patterns

## 서버 컴포넌트 (기본)

```tsx
// app/agents/page.tsx — 서버 컴포넌트 (기본)
import { getAgents } from "@/lib/api/agents";
import { AgentList } from "@/components/features/agent-list";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Agents</h1>
      <AgentList agents={agents} />
    </div>
  );
}
```

## 클라이언트 컴포넌트 (상태/이벤트 필요 시)

```tsx
// components/features/agent-list.tsx
"use client";

import { useState } from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import type { Agent } from "@/types/agent";

interface AgentListProps {
  agents: Agent[];
}

export function AgentList({ agents }: AgentListProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          isPressable
          isHoverable
          onPress={() => setSelected(agent.id)}
          className={selected === agent.id ? "border-primary" : ""}
        >
          <CardBody>
            <h3 className="text-lg font-semibold">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.description}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
```

## API 클라이언트 (lib/api/)

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "API request failed");
  }

  return res.json();
}

// lib/api/agents.ts
import { apiClient } from "./client";
import type { Agent, CreateAgentInput } from "@/types/agent";

export async function getAgents(): Promise<Agent[]> {
  return apiClient<Agent[]>("/api/v1/agents");
}

export async function createAgent(data: CreateAgentInput): Promise<Agent> {
  return apiClient<Agent>("/api/v1/agents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

## TypeScript 타입 (types/)

```typescript
// types/agent.ts
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  systemPrompt: string;
  model?: string;
}
```

## Zustand 상태 관리 (stores/)

```typescript
// stores/agent-store.ts
import { create } from "zustand";
import type { Agent } from "@/types/agent";

interface AgentStore {
  agents: Agent[];
  selectedId: string | null;
  setAgents: (agents: Agent[]) => void;
  selectAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedId: null,
  setAgents: (agents) => set({ agents }),
  selectAgent: (id) => set({ selectedId: id }),
}));
```

## 파일 네이밍 규칙

- 파일명: `kebab-case.tsx` (`agent-list.tsx`, `create-agent-modal.tsx`)
- 컴포넌트명: `PascalCase` (`AgentList`, `CreateAgentModal`)
- 훅: `use` 접두사 (`useAgents`, `useAgentStore`)
- 공통 UI: `components/ui/` → NextUI 기반 래핑
- 기능별: `components/features/` → 도메인 로직 포함

## 규칙 요약

- 서버 컴포넌트가 기본. `'use client'`는 상태/이벤트 필요 시에만
- `any` 금지 → `unknown` 사용
- `interface` 우선 (`type`보다)
- 데이터 페칭: 서버 컴포넌트에서 직접, 클라이언트는 props로 전달
- NextUI 컴포넌트 적극 활용
