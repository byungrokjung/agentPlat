const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function transformKeys<T>(
  obj: unknown,
  transformer: (key: string) => string
): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer)) as T
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[transformer(key)] = transformKeys(value, transformer)
    }
    return result as T
  }
  return obj as T
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  let body = options?.body
  if (body && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body)
      body = JSON.stringify(transformKeys(parsed, camelToSnake))
    } catch {
      // Keep original body if not valid JSON
    }
  }

  const response = await fetch(url, {
    ...options,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      error.message || error.detail || 'An error occurred'
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()
  return transformKeys<T>(data, snakeToCamel)
}
