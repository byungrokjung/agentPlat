'use client'

import { useState } from 'react'
import { AgentForm } from '@/components/features/agent'
import { createAgent } from '@/lib/api/agents'
import type { AgentCreate } from '@/types/agent'

export default function NewAgentPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(data: AgentCreate) {
    setIsLoading(true)
    try {
      await createAgent(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">새 에이전트 만들기</h1>
      <AgentForm onSubmit={handleSubmit} isLoading={isLoading} />
    </main>
  )
}
