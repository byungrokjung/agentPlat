'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Spinner } from '@nextui-org/react'
import { AgentForm } from '@/components/features/agent'
import { getAgent, updateAgent } from '@/lib/api/agents'
import type { Agent, AgentUpdate } from '@/types/agent'

export default function EditAgentPage() {
  const params = useParams()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  async function loadAgent() {
    try {
      setLoading(true)
      const data = await getAgent(agentId)
      setAgent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: AgentUpdate) {
    setSaving(true)
    try {
      await updateAgent(agentId, data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Agent not found'}
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">에이전트 수정</h1>
      <AgentForm agent={agent} onSubmit={handleSubmit} isLoading={saving} />
    </main>
  )
}
