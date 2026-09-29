-- TASK-010: Schema & Row Level Security
-- Digital Public Good: JanSanket Planning Intelligence
-- strictly only citizen_requests and district_context tables

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: citizen_requests
-- Stores normalized citizen requests extracted by Gemini or fallback
CREATE TABLE IF NOT EXISTS citizen_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('text', 'voice', 'manual_fallback')),
    raw_text TEXT NOT NULL,
    language_code TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'roads', 'water', 'sanitation', 'healthcare',
        'education', 'power', 'transport', 'other'
    )),
    need_summary TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    ai_confidence NUMERIC(4, 2) NOT NULL CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for aggregation by district and category
CREATE INDEX IF NOT EXISTS idx_citizen_requests_aggregation 
    ON citizen_requests (state, district, category);

-- 2. Table: district_context
-- Keyed strictly by state + district + category
CREATE TABLE IF NOT EXISTS district_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'roads', 'water', 'sanitation', 'healthcare',
        'education', 'power', 'transport', 'other'
    )),
    population INTEGER NOT NULL CHECK (population > 0),
    infrastructure_gap_index NUMERIC(5, 2) NOT NULL CHECK (
        infrastructure_gap_index >= 0.0 AND infrastructure_gap_index <= 100.0
    ),
    planned_coverage_pct NUMERIC(5, 2) NOT NULL CHECK (
        planned_coverage_pct >= 0.0 AND planned_coverage_pct <= 100.0
    ),
    population_impact_score NUMERIC(5, 2) NOT NULL CHECK (
        population_impact_score >= 0.0 AND population_impact_score <= 100.0
    ),
    source_status TEXT NOT NULL DEFAULT 'demo_synthetic',
    source_url TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_district_context_key UNIQUE (state, district, category)
);

CREATE INDEX IF NOT EXISTS idx_district_context_lookup 
    ON district_context (state, district, category);

-- 3. Row Level Security (RLS)
ALTER TABLE citizen_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_context ENABLE ROW LEVEL SECURITY;

-- Allow public/anon read access for dashboard queries
CREATE POLICY "Allow public read access on citizen_requests"
    ON citizen_requests FOR SELECT
    USING (true);

-- Allow server-side inserts strictly via service_role (blocks direct browser/client anon inserts)
CREATE POLICY "Allow service_role insert on citizen_requests"
    ON citizen_requests FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow public read access on district context
CREATE POLICY "Allow public read access on district_context"
    ON district_context FOR SELECT
    USING (true);
