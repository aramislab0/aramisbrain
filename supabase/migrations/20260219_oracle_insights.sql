-- Migration ORACLE v0.2 Day 3 - Oracle Insights & Trajectories

-- Table pour les trajectoires stratégiques
CREATE TABLE IF NOT EXISTS oracle_trajectories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  trajectory_number INTEGER NOT NULL, -- 1, 2, or 3
  title VARCHAR(200) NOT NULL,
  context TEXT NOT NULL,
  what_it_means TEXT NOT NULL,
  tradeoffs TEXT,
  timeline_estimate VARCHAR(100),
  focus_allocation JSONB, -- ex: { "teggi": 70, "sira": 30 }
  questions TEXT[], -- questions stratégiques pour réflexion
  tone VARCHAR(20) DEFAULT 'neutral', -- 'opportunity', 'neutral', 'gentle_attention'
  confidence_note TEXT, -- note sur incertitudes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start_date, trajectory_number)
);

-- Table pour les questions stratégiques hebdomadaires
CREATE TABLE IF NOT EXISTS oracle_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  question TEXT NOT NULL,
  context TEXT NOT NULL,
  why_now TEXT NOT NULL,
  related_entity_type VARCHAR(50), -- 'project', 'decision', 'portfolio', null
  related_entity_id UUID,
  question_type VARCHAR(50), -- 'reflection', 'decision', 'priority', 'strategy'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les weekly summaries narratifs
CREATE TABLE IF NOT EXISTS oracle_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL UNIQUE,
  week_end_date DATE NOT NULL,
  overview_narrative TEXT NOT NULL,
  what_advances TEXT, -- ce qui progresse
  needs_attention TEXT, -- ce qui demande attention (tone calme)
  decisions_made TEXT, -- décisions prises
  full_summary_markdown TEXT, -- markdown complet
  tone_check VARCHAR(20) DEFAULT 'calm', -- toujours 'calm', jamais 'urgent'
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_oracle_trajectories_week ON oracle_trajectories(week_start_date DESC);
CREATE INDEX idx_oracle_questions_week ON oracle_questions(week_start_date DESC);
CREATE INDEX idx_oracle_summaries_week ON oracle_weekly_summaries(week_start_date DESC);
