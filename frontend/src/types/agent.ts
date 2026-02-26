export interface Agent {
  id: string
  name: string
  description?: string
  prompt: string
  model?: string
  createdAt: string
  updatedAt: string
}

export interface AgentCreate {
  name: string
  description?: string
  prompt: string
  model?: string
}

export interface AgentUpdate {
  name?: string
  description?: string
  prompt?: string
  model?: string
}

export interface AgentExecuteInput {
  userInput: string
}

export interface AgentExecuteOutput {
  result: string
  tokensUsed?: number
  executionTimeMs?: number
}
