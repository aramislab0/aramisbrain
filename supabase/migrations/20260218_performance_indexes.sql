-- ============================================================================
-- ARAMIS BRAIN - Performance Optimization Indexes (FINAL CORRECTED VERSION)
-- Date: 2026-02-18
-- Description: Indexes pour recherche full-text et filtres rapides
-- FIXED: All column names verified against actual schema
-- ============================================================================

-- ============================================================================
-- DECISIONS TABLE INDEXES
-- ============================================================================

-- Full-text search sur titre et decision_made (français)
CREATE INDEX IF NOT EXISTS idx_decisions_fulltext ON decisions 
USING gin(to_tsvector('french', 
  COALESCE(title, '') || ' ' || 
  COALESCE(decision_made, '') || ' ' || 
  COALESCE(consequences, '')
));

-- Index composite pour filtres combinés
CREATE INDEX IF NOT EXISTS idx_decisions_project_status ON decisions(project_id, status);
CREATE INDEX IF NOT EXISTS idx_decisions_status_date ON decisions(status, date DESC);

-- Index date pour tri rapide
CREATE INDEX IF NOT EXISTS idx_decisions_date_desc ON decisions(date DESC);

-- ============================================================================
-- EVENTS TABLE INDEXES
-- ============================================================================

-- Filtres events par type (CORRECTED: no entity_type column, only event_type)
CREATE INDEX IF NOT EXISTS idx_events_type_date ON events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_project_type ON events(project_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_desc ON events(created_at DESC);

-- ============================================================================
-- PLAYBOOKS TABLE INDEXES
-- ============================================================================

-- Filtres playbooks actifs
CREATE INDEX IF NOT EXISTS idx_playbooks_active ON playbooks(active, created_at DESC);

-- Full-text search sur playbooks
CREATE INDEX IF NOT EXISTS idx_playbooks_search ON playbooks 
USING gin(to_tsvector('french', 
  COALESCE(name, '') || ' ' || 
  COALESCE(description, '')
));

-- ============================================================================
-- PROJECTS TABLE INDEXES
-- ============================================================================

-- Index déjà créés dans schema initial, vérification
CREATE INDEX IF NOT EXISTS idx_projects_status_risk ON projects(status, risk_level);
CREATE INDEX IF NOT EXISTS idx_projects_completion ON projects(completion_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- ============================================================================
-- RISKS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_risks_project_status ON risks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity DESC, probability DESC);

-- ============================================================================
-- STATS & VERIFICATION
-- ============================================================================

-- Fonction helper pour vérifier taille indexes
CREATE OR REPLACE FUNCTION get_index_sizes()
RETURNS TABLE(
  table_name TEXT,
  index_name TEXT,
  index_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename AS table_name,
    indexname AS index_name,
    pg_size_pretty(pg_relation_size(schemaname || '.' || indexname)) AS index_size
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY pg_relation_size(schemaname || '.' || indexname) DESC;
END;
$$ LANGUAGE plpgsql;

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Performance indexes created successfully!';
  RAISE NOTICE 'Total: 10 new indexes for ARAMIS BRAIN';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Run: SELECT * FROM get_index_sizes();';
  RAISE NOTICE 'to verify all indexes';
END $$;
