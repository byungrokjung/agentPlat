'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold text-lg">AgentPlat</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/agents" className="text-sm text-gray-400 hover:text-white transition">
              Agents
            </Link>
            <Link href="/outputs" className="text-sm text-gray-400 hover:text-white transition">
              Outputs
            </Link>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20">
            ✨ AI-Powered Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Build AI Agents
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text">
              That Actually Work
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, deploy, and manage AI agents with ease. 
            Automate your workflows with intelligent agents powered by Claude.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/playground">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto mt-32 grid md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle className="text-white">AI Agents</CardTitle>
              <CardDescription className="text-gray-400">
                Create custom AI agents with specialized prompts and capabilities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <CardTitle className="text-white">Workflows</CardTitle>
              <CardDescription className="text-gray-400">
                Chain agents together to create powerful automated workflows.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-white">Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Track performance and optimize your agents with detailed insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto mt-32 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">100+</div>
            <div className="text-gray-500">Agents Created</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-gray-500">Executions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-500">Uptime</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <div>© 2026 AgentPlat. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
