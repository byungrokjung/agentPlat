'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAgents } from '@/lib/api/agents';
import { ChatInterface } from '@/components/features/agent/ChatInterface';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/types/agent';

export default function PlaygroundPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await getAgents();
        setAgents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="font-semibold text-lg">AgentPlat</span>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-lg font-medium text-gray-300">Playground</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
        {/* Left Panel - Agent List */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Agents
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-800/50 rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isLoading && !error && agents.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">No agents found.</p>
                <Link
                  href="/agents/new"
                  className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block"
                >
                  Create your first agent
                </Link>
              </div>
            )}

            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-4 border-b border-gray-800/50 transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-violet-500/10 border-l-2 border-l-violet-500'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">
                    {agent.name}
                  </span>
                  {agent.model && (
                    <Badge
                      variant="secondary"
                      className="ml-2 text-xs bg-gray-800 text-gray-400 border-gray-700 shrink-0"
                    >
                      {agent.model}
                    </Badge>
                  )}
                </div>
                {agent.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {agent.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Panel - Chat Interface */}
        <main className="flex-1 flex flex-col min-w-0">
          {selectedAgent ? (
            <>
              <div className="px-6 py-3 border-b border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h2 className="font-medium text-sm">{selectedAgent.name}</h2>
                  {selectedAgent.description && (
                    <p className="text-xs text-gray-500">
                      {selectedAgent.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <ChatInterface
                  key={selectedAgent.id}
                  agentId={selectedAgent.id}
                  agentName={selectedAgent.name}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl opacity-50">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  Select an Agent
                </h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  Choose an agent from the list to start a conversation.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
