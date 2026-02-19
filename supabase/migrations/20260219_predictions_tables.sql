-- Migration ORACLE v0.2 Day 2 - Predictions Engine Tables

-- Table pour les prédictions de risques
CREATE TABLE IF NOT EXISTS risk_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_type VARCHAR(100), -- 'technical', 'administrative', 'financial', 'dispersion'
  predicted_severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  probability_score DECIMAL(5,2) NOT NULL, -- 0-100%
  estimated_impact VARCHAR(50), -- 'minor', 'moderate', 'major', 'severe'
  time_horizon_days INTEGER, -- dans combien de jours
  predicted_occurrence_date DATE,
  confidence_level DECIMAL(5,2), -- 0-100% confiance dans la prédiction
  factors JSONB, -- facteurs qui ont mené à cette prédiction
  mitigation_suggestions TEXT[],
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'occurred', 'avoided', 'expired'
  actual_occurrence_date DATE,
  prediction_accuracy DECIMAL(5,2), -- si occurred, quelle était la précision
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les prédictions de completion
CREATE TABLE IF NOT EXISTS completion_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_completion DECIMAL(5,2),
  predicted_completion_date DATE NOT NULL,
  optimistic_date DATE, -- si tout va bien
  realistic_date DATE, -- scenario probable
  pessimistic_date DATE, -- si problèmes
  confidence_level DECIMAL(5,2), -- 0-100%
  velocity_assumption DECIMAL(5,2), -- vélocité utilisée pour calcul
  factors JSONB, -- facteurs pris en compte
  blockers_assumed INTEGER, -- nombre de blockers anticipés
  status VARCHAR(20) DEFAULT 'active',
  actual_completion_date DATE,
  prediction_accuracy_days INTEGER, -- écart en jours si completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, forecast_date)
);

-- Table pour les bottlenecks prédits
CREATE TABLE IF NOT EXISTS bottleneck_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bottleneck_type VARCHAR(100), -- 'resource', 'dependency', 'technical', 'decision'
  bottleneck_description TEXT NOT NULL,
  probability_score DECIMAL(5,2), -- 0-100%
  estimated_impact_days INTEGER, -- impact en jours de retard
  time_horizon_days INTEGER, -- dans combien de jours
  predicted_occurrence_date DATE,
  mitigation_actions TEXT[],
  priority VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) DEFAULT 'active',
  occurred BOOLEAN DEFAULT FALSE,
  avoided BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_risk_predictions_project ON risk_predictions(project_id);
CREATE INDEX idx_risk_predictions_date ON risk_predictions(prediction_date DESC);
CREATE INDEX idx_risk_predictions_status ON risk_predictions(status, probability_score DESC);
CREATE INDEX idx_completion_forecasts_project ON completion_forecasts(project_id);
CREATE INDEX idx_completion_forecasts_date ON completion_forecasts(forecast_date DESC);
CREATE INDEX idx_bottleneck_predictions_project ON bottleneck_predictions(project_id);
CREATE INDEX idx_bottleneck_predictions_priority ON bottleneck_predictions(priority, probability_score DESC);

-- Trigger auto-update
CREATE TRIGGER update_risk_predictions_updated_at BEFORE UPDATE ON risk_predictions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completion_forecasts_updated_at BEFORE UPDATE ON completion_forecasts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bottleneck_predictions_updated_at BEFORE UPDATE ON bottleneck_predictions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
