-- FIX: Add missing columns to decisions table
-- Run this in Supabase SQL Editor to fix schema mismatch

-- Add new columns
ALTER TABLE decisions 
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS options_considered JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS decision_made TEXT,
ADD COLUMN IF NOT EXISTS consequences TEXT,
ADD COLUMN IF NOT EXISTS revisit_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add constraint for status
ALTER TABLE decisions 
DROP CONSTRAINT IF EXISTS decisions_status_check;

ALTER TABLE decisions
ADD CONSTRAINT decisions_status_check CHECK (status IN ('active', 'executed', 'reversed', 'pending'));

-- Migrate existing data from old columns to new ones
UPDATE decisions 
SET decision_made = decision,
    options_considered = alternatives_considered
WHERE decision_made IS NULL OR options_considered IS NULL;

-- Drop old columns that are no longer needed
ALTER TABLE decisions
DROP COLUMN IF EXISTS decision,
DROP COLUMN IF EXISTS alternatives_considered,
DROP COLUMN IF EXISTS context,
DROP COLUMN IF EXISTS rationale,
DROP COLUMN IF EXISTS impact_expected,
DROP COLUMN IF EXISTS impact_actual,
DROP COLUMN IF EXISTS feedback;

COMMENT ON TABLE decisions IS 'ARAMIS BRAIN v0.1 - Decisions table schema fixed';
