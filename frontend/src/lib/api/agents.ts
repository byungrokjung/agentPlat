import { apiClient } from './client'
import type {
  Agent,
  AgentCreate,
  AgentUpdate,
  AgentExecuteInput,
  AgentExecuteOutput,
} from '@/types/agent'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAgents(skip = 0, limit = 20): Promise<Agent[]> {
  return apiClient<Agent[]>(`/api/v1/agents?skip=${skip}&limit=${limit}`)
}

export async function getAgent(id: string): Promise<Agent> {
  return apiClient<Agent>(`/api/v1/agents/${id}`)
}

export async function createAgent(data: AgentCreate): Promise<Agent> {
  return apiClient<Agent>('/api/v1/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAgent(id: string, data: AgentUpdate): Promise<Agent> {
  return apiClient<Agent>(`/api/v1/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteAgent(id: string): Promise<void> {
  await apiClient<void>(`/api/v1/agents/${id}`, {
    method: 'DELETE',
  })
}

export async function executeAgent(
  id: string,
  input: AgentExecuteInput
): Promise<AgentExecuteOutput> {
  return apiClient<AgentExecuteOutput>(`/api/v1/agents/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function* executeAgentStream(
  id: string,
  input: AgentExecuteInput
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_URL}/api/v1/agents/${id}/execute/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to execute agent: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') {
          return
        }
        if (data.startsWith('[ERROR]')) {
          throw new Error(data.slice(8))
        }
        yield data
      }
    }
  }
}

export interface Execution {
  id: string
  agentId: string
  userInput: string
  result: string
  tokensUsed: number
  executionTimeMs: number
  createdAt: string
}

export async function getExecutions(
  agentId: string,
  skip = 0,
  limit = 20
): Promise<Execution[]> {
  return apiClient<Execution[]>(
    `/api/v1/agents/${agentId}/executions?skip=${skip}&limit=${limit}`
  )
}
