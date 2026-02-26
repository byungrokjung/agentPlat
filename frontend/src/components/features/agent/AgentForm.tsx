'use client'

import { useState } from 'react'
import { Input, Textarea, Button, Select, SelectItem } from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import type { Agent, AgentCreate, AgentUpdate } from '@/types/agent'

const MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
]

interface AgentFormCreateProps {
  agent?: undefined
  onSubmit: (data: AgentCreate) => Promise<void>
  isLoading?: boolean
}

interface AgentFormEditProps {
  agent: Agent
  onSubmit: (data: AgentUpdate) => Promise<void>
  isLoading?: boolean
}

type AgentFormProps = AgentFormCreateProps | AgentFormEditProps

export function AgentForm({ agent, onSubmit, isLoading }: AgentFormProps) {
  const router = useRouter()
  const [name, setName] = useState(agent?.name || '')
  const [description, setDescription] = useState(agent?.description || '')
  const [prompt, setPrompt] = useState(agent?.prompt || '')
  const [model, setModel] = useState(agent?.model || 'claude-sonnet-4-20250514')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('이름을 입력해주세요')
      return
    }
    if (prompt.length < 10) {
      setError('시스템 프롬프트는 최소 10자 이상이어야 합니다')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        prompt: prompt.trim(),
        model,
      })
      router.push('/agents')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save agent')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Input
        label="에이전트 이름"
        placeholder="예: 고객 지원 봇"
        value={name}
        onValueChange={setName}
        isRequired
        maxLength={100}
      />

      <Textarea
        label="설명 (선택)"
        placeholder="이 에이전트가 무엇을 하는지 간단히 설명해주세요"
        value={description}
        onValueChange={setDescription}
        maxRows={3}
      />

      <Textarea
        label="시스템 프롬프트"
        placeholder="에이전트의 역할과 행동 방식을 정의하세요..."
        value={prompt}
        onValueChange={setPrompt}
        isRequired
        minRows={6}
        maxRows={20}
        description="에이전트의 성격, 전문 분야, 응답 스타일 등을 정의합니다"
      />

      <Select
        label="모델"
        selectedKeys={[model]}
        onChange={(e) => setModel(e.target.value)}
      >
        {MODELS.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}
          </SelectItem>
        ))}
      </Select>

      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="bordered"
          onPress={() => router.back()}
          isDisabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" color="primary" isLoading={isLoading}>
          {agent ? '저장' : '만들기'}
        </Button>
      </div>
    </form>
  )
}
