'use client'

import { Card, CardBody, CardFooter, Button, Chip } from '@nextui-org/react'
import Link from 'next/link'
import type { Agent } from '@/types/agent'

interface AgentCardProps {
  agent: Agent
  onDelete?: (id: string) => void
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  return (
    <Card className="w-full">
      <CardBody className="gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{agent.name}</h3>
          <Chip size="sm" variant="flat">
            {agent.model?.split('-')[1] || 'sonnet'}
          </Chip>
        </div>
        {agent.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{agent.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(agent.createdAt).toLocaleDateString('ko-KR')}
        </p>
      </CardBody>
      <CardFooter className="gap-2 justify-end">
        <Button
          as={Link}
          href={`/agents/${agent.id}/chat`}
          color="primary"
          size="sm"
        >
          실행
        </Button>
        <Button
          as={Link}
          href={`/agents/${agent.id}/edit`}
          variant="bordered"
          size="sm"
        >
          수정
        </Button>
        {onDelete && (
          <Button
            color="danger"
            variant="light"
            size="sm"
            onPress={() => onDelete(agent.id)}
          >
            삭제
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
