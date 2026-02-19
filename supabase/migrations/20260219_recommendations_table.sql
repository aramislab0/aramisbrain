-- Migration ORACLE v0.2 Day 3 - Recommendations Engine

-- Table pour les recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(50) NOT NULL, -- 'focus', 'decision', 'resource', 'risk_mitigation', 'opportunity'
  priority INTEGER NOT NULL, -- 1 (highest) to 5 (lowest)
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT, -- pourquoi cette recommandation
  expected_impact VARCHAR(100), -- 'high', 'medium', 'low'
  estimated_effort VARCHAR(100), -- 'quick_win', 'moderate', 'significant'
  time_sensitive BOOLEAN DEFAULT FALSE,
  deadline_date DATE,
  target_entity_type VARCHAR(50), -- 'project', 'portfolio', 'decision', null
  target_entity_id UUID,
  actionable_steps TEXT[], -- liste d'actions concrètes
  related_playbook_id UUID REFERENCES playbooks(id) ON DELETE SET NULL,
  confidence_score DECIMAL(5,2), -- 0-100
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'accepted', 'rejected', 'completed', 'expired'
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  completed_at TIMESTAMPTZ,
  outcome_notes TEXT,
  effectiveness_score DECIMAL(5,2), -- si completed, quelle était l'efficacité 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour tracking des suggestions acceptées/rejetées (learning)
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  feedback_type VARCHAR(20) NOT NULL, -- 'accepted', 'rejected', 'partially_accepted'
  feedback_date TIMESTAMPTZ DEFAULT NOW(),
  feedback_notes TEXT,
  actual_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recommendations_date ON recommendations(recommendation_date DESC);
CREATE INDEX idx_recommendations_priority ON recommendations(priority, status);
CREATE INDEX idx_recommendations_category ON recommendations(category, status);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_entity ON recommendations(target_entity_type, target_entity_id);
CREATE INDEX idx_recommendation_feedback_recommendation ON recommendation_feedback(recommendation_id);

-- Trigger auto-update
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
