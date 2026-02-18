-- ARAMIS BRAIN v0.1 - Database Schema
-- Created: 2026-02-17
-- Description: Complete database schema for executive command center

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: projects
-- Centralizes all Aramis Lab projects with real-time status
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'blocked', 'completed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  priority INTEGER DEFAULT 0,
  cash_impact_score INTEGER CHECK (cash_impact_score >= 0 AND cash_impact_score <= 10),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  main_blocker TEXT,
  next_action TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_risk_level ON projects(risk_level);

-- ============================================================================
-- TABLE: decisions
-- Journal of decisions made with context and impact tracking
-- ============================================================================
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  context TEXT,
  decision TEXT NOT NULL,
  rationale TEXT,
  alternatives_considered JSONB DEFAULT '[]',
  impact_expected TEXT,
  impact_actual TEXT,
  feedback INTEGER CHECK (feedback IN (-1, 0, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_decisions_project_id ON decisions(project_id);
CREATE INDEX idx_decisions_feedback ON decisions(feedback);

-- ============================================================================
-- TABLE: risks
-- Multi-dimensional risk radar tracking
-- ============================================================================
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'administrative', 'financial', 'dispersion')),
  title TEXT NOT NULL,
  description TEXT,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  probability INTEGER CHECK (probability >= 1 AND probability <= 5),
  mitigation_plan TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_risks_project_id ON risks(project_id);
CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_status ON risks(status);

-- ============================================================================
-- TABLE: daily_focus
-- Daily executive priorities and critical items
-- ============================================================================
CREATE TABLE daily_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  priority_1 TEXT NOT NULL,
  priority_2 TEXT NOT NULL,
  priority_3 TEXT NOT NULL,
  critical_risk TEXT,
  decision_needed TEXT,
  ignore_this TEXT,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_daily_focus_date ON daily_focus(date DESC);

-- ============================================================================
-- TABLE: events
-- Automatic journal of daily actions and changes
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- ============================================================================
-- TABLE: ai_conversations
-- History of AI dialogues with GPT and Claude
-- ============================================================================
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'claude')),
  messages JSONB NOT NULL DEFAULT '[]',
  context_injected JSONB DEFAULT '{}',
  feedback INTEGER CHECK (feedback IN (-1, 0, 1)),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_conversations_provider ON ai_conversations(provider);
CREATE INDEX idx_ai_conversations_feedback ON ai_conversations(feedback);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- ============================================================================
-- TABLE: playbooks (v0.1 - Empty structure for future)
-- Structured decision rules for automation (v0.3+)
-- ============================================================================
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbooks_updated_at
  BEFORE UPDATE ON playbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Initial Aramis Lab Projects
-- ============================================================================
INSERT INTO projects (name, slug, status, completion_percentage, priority, cash_impact_score, risk_level, main_blocker, next_action, metadata) VALUES
('SIRA - Livraison Communautaire', 'sira', 'active', 15, 10, 9, 'medium', 'Styles CSS non appliqués', 'Fixer les problèmes Tailwind CSS', '{"tech_stack": ["Next.js", "Tailwind"], "repository": "sira-web-app"}'),
('Aramis Studio Core', 'aramis-studio-core', 'active', 85, 9, 7, 'low', 'Aucun blocage majeur', 'Finaliser Sprint 20 features', '{"tech_stack": ["Next.js", "Supabase", "Turborepo"], "version": "v2.6.1"}'),
('WURUS - Or Fractionné', 'wurus', 'paused', 60, 7, 6, 'medium', 'Attente validation MVP', 'Reprendre développement wallet', '{"tech_stack": ["React Native", "Supabase"], "beta_date": "2024-12"}'),
('SOLÜ - Vide-Dressing', 'solu', 'active', 70, 8, 8, 'low', 'Aucun blocage', 'Tester API FLUZ payment', '{"tech_stack": ["Next.js", "Firebase"], "users": 1234}'),
('FLUZ - Payment Infrastructure', 'fluz', 'active', 92, 10, 10, 'low', 'Aucun blocage', 'Documentation DevOps', '{"maturity_score": 92, "integrations": ["Orange Money"]}'),
('Teyliom Experience', 'teyliom', 'completed', 100, 3, 5, 'low', 'Aucun', 'Maintenance seulement', '{"tech_stack": ["Next.js", "VR 360"], "client": "Teyliom Properties"}');

-- ============================================================================
-- SEED DATA: Initial Risks
-- ============================================================================
INSERT INTO risks (project_id, category, title, severity, probability, status) VALUES
((SELECT id FROM projects WHERE slug = 'sira'), 'technical', 'CSS Tailwind non appliqué', 3, 4, 'active'),
((SELECT id FROM projects WHERE slug = 'wurus'), 'financial', 'Budget limité pour campagne marketing', 4, 3, 'monitoring'),
((SELECT id FROM projects WHERE slug = 'fluz'), 'administrative', 'Conformité PSP Senegal à valider', 2, 2, 'monitoring');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
COMMENT ON DATABASE postgres IS 'ARAMIS BRAIN v0.1 - Schema deployed successfully';
