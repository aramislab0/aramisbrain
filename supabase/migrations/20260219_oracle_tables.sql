-- Migration ORACLE v0.2 - Analysis Engine Tables

-- Table pour stocker les analyses de patterns
CREATE TABLE IF NOT EXISTS pattern_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  velocity_7d DECIMAL(5,2), -- % progression 7 derniers jours
  velocity_30d DECIMAL(5,2), -- % progression 30 derniers jours
  velocity_trend VARCHAR(20), -- 'accelerating', 'stable', 'decelerating', 'stagnant'
  blockers_count INTEGER DEFAULT 0,
  blockers_recurring TEXT[], -- array des blockers récurrents
  decisions_velocity INTEGER, -- nombre décisions 30j
  last_activity_days INTEGER, -- jours depuis dernière activité
  momentum_score DECIMAL(5,2), -- 0-100 score de momentum
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les health scores
CREATE TABLE IF NOT EXISTS health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score DECIMAL(5,2) NOT NULL, -- 0-100
  completion_score DECIMAL(5,2), -- 0-100
  velocity_score DECIMAL(5,2), -- 0-100
  risk_score DECIMAL(5,2), -- 0-100
  cash_impact_score DECIMAL(5,2), -- 0-100
  decision_quality_score DECIMAL(5,2), -- 0-100
  momentum_score DECIMAL(5,2), -- 0-100
  grade VARCHAR(20), -- 'excellent', 'good', 'warning', 'critical'
  factors_breakdown JSONB, -- détails des calculs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, score_date)
);

-- Table pour le health score global portefeuille
CREATE TABLE IF NOT EXISTS portfolio_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score DECIMAL(5,2) NOT NULL, -- 0-100
  projects_count INTEGER,
  projects_healthy INTEGER, -- score > 70
  projects_warning INTEGER, -- score 50-70
  projects_critical INTEGER, -- score < 50
  trend_7d DECIMAL(5,2), -- delta vs 7 jours avant
  trend_30d DECIMAL(5,2), -- delta vs 30 jours avant
  top_concern TEXT,
  top_opportunity TEXT,
  factors_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(score_date)
);

-- Table pour les anomalies détectées
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  anomaly_type VARCHAR(50), -- 'velocity_drop', 'stagnation', 'risk_spike', etc.
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  metric_name VARCHAR(100),
  baseline_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  deviation_percent DECIMAL(5,2),
  description TEXT,
  is_positive BOOLEAN DEFAULT FALSE, -- true si anomalie positive (opportunité)
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX idx_pattern_analyses_project ON pattern_analyses(project_id);
CREATE INDEX idx_pattern_analyses_date ON pattern_analyses(analysis_date DESC);
CREATE INDEX idx_health_scores_project ON health_scores(project_id);
CREATE INDEX idx_health_scores_date ON health_scores(score_date DESC);
CREATE INDEX idx_portfolio_health_date ON portfolio_health(score_date DESC);
CREATE INDEX idx_anomalies_project ON anomalies(project_id);
CREATE INDEX idx_anomalies_severity ON anomalies(severity, detected_at DESC);
CREATE INDEX idx_anomalies_unresolved ON anomalies(resolved) WHERE resolved = FALSE;

-- Trigger pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pattern_analyses_updated_at BEFORE UPDATE ON pattern_analyses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_scores_updated_at BEFORE UPDATE ON health_scores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
