'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Spinner, Button } from '@nextui-org/react'
import { ChatInterface } from '@/components/features/agent'
import { getAgent } from '@/lib/api/agents'
import type { Agent } from '@/types/agent'

export default function AgentChatPage() {
  const params = useParams()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Agent not found'}
        </div>
        <Button as={Link} href="/agents" className="mt-4">
          목록으로 돌아가기
        </Button>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          {agent.description && (
            <p className="text-sm text-gray-500">{agent.description}</p>
          )}
        </div>
        <Button as={Link} href="/agents" variant="bordered" size="sm">
          목록으로
        </Button>
      </div>

      <ChatInterface agentId={agentId} agentName={agent.name} />
    </main>
  )
}
