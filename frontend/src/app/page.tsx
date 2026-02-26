import { Button } from '@nextui-org/react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">AI Agent Platform</h1>
        <p className="text-xl text-gray-500">
          Claude API로 커스텀 AI 에이전트를 만들고 실행하세요
        </p>
        <div className="flex gap-4 justify-center">
          <Button as={Link} href="/agents" color="primary" size="lg">
            에이전트 보기
          </Button>
          <Button as={Link} href="/agents/new" variant="bordered" size="lg">
            에이전트 만들기
          </Button>
        </div>
      </div>
    </main>
  )
}
