'use client'

import { useState, useRef, useEffect } from 'react'
import { Textarea, Button, ScrollShadow } from '@nextui-org/react'
import { executeAgentStream } from '@/lib/api/agents'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  agentId: string
  agentName: string
}

export function ChatInterface({ agentId, agentName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      const stream = executeAgentStream(agentId, { userInput: userMessage })
      for await (const chunk of stream) {
        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: updated[lastIdx].content + chunk,
          }
          return updated
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <ScrollShadow className="flex-1 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>{agentName}에게 메시지를 보내보세요</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {msg.content || (isStreaming && idx === messages.length - 1 ? '...' : '')}
              </pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollShadow>

      {error && (
        <div className="mx-4 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onValueChange={setInput}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            minRows={1}
            maxRows={4}
            className="flex-1"
            isDisabled={isStreaming}
          />
          <Button
            type="submit"
            color="primary"
            isLoading={isStreaming}
            isDisabled={!input.trim()}
          >
            전송
          </Button>
        </div>
      </form>
    </div>
  )
}
