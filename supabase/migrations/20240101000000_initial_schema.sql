-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    model VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX idx_agents_created_at ON public.agents(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create agent_executions table for tracking execution history
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_input TEXT NOT NULL,
    result TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on agent_id and created_at for querying execution history
CREATE INDEX idx_agent_executions_agent_id ON public.agent_executions(agent_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, can be restricted later with auth)
CREATE POLICY "Allow all operations on agents" ON public.agents
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on agent_executions" ON public.agent_executions
    FOR ALL USING (true) WITH CHECK (true);
