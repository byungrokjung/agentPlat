'use client'

import { useEffect, useState } from 'react'
import { Button, Spinner } from '@nextui-org/react'
import Link from 'next/link'
import { AgentCard } from '@/components/features/agent'
import { getAgents, deleteAgent } from '@/lib/api/agents'
import type { Agent } from '@/types/agent'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAgents()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteAgent(id)
      setAgents(agents.filter((a) => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">내 에이전트</h1>
        <Button as={Link} href="/agents/new" color="primary">
          새 에이전트 만들기
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">아직 에이전트가 없습니다</p>
          <Button as={Link} href="/agents/new" color="primary" variant="bordered">
            첫 에이전트 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  )
}
