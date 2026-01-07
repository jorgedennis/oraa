-- Oraa Database Schema
-- Migration: "No" Response Tracking
-- Created: 2026-01-07
-- 
-- This migration adds fields to track re-surfacing logic for dismissed insights.
-- "No" means "not convinced yet," not "never show me again."
--
-- Behavior:
-- - After user says "No", continue accumulating evidence
-- - After 3 additional strong hits (≥0.65), re-surface to staging
-- - Max 2 re-surfaces total — after 3rd "No," truly dismiss (stop tracking)

-- ============================================================================
-- 1. ADD NO RESPONSE TRACKING TO INSIGHT_EVIDENCE
-- ============================================================================

-- Add columns to track "No" response re-surfacing logic
ALTER TABLE public.insight_evidence
  ADD COLUMN IF NOT EXISTS no_response_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS hits_since_last_no integer DEFAULT 0 NOT NULL;

-- Add constraint to ensure no_response_count is within valid range (0-3)
ALTER TABLE public.insight_evidence
  ADD CONSTRAINT check_no_response_count 
  CHECK (no_response_count >= 0 AND no_response_count <= 3);

-- Add comments
COMMENT ON COLUMN public.insight_evidence.no_response_count IS 'How many times user said "No" to this insight (0-3). At 3, truly dismissed.';
COMMENT ON COLUMN public.insight_evidence.hits_since_last_no IS 'Strong hits (≥0.65) accumulated since last "No" response. Re-surface when >= 3.';

-- ============================================================================
-- 2. UPDATE STATUS CHECK CONSTRAINT
-- ============================================================================

-- Update status to include 'truly_dismissed' for insights at no_response_count = 3
ALTER TABLE public.insight_evidence
  DROP CONSTRAINT IF EXISTS insight_evidence_status_check;

ALTER TABLE public.insight_evidence
  ADD CONSTRAINT insight_evidence_status_check
  CHECK (status IN ('accumulating', 'promoted', 'dismissed', 'truly_dismissed'));

-- Update comment
COMMENT ON COLUMN public.insight_evidence.status IS 'accumulating (collecting evidence), promoted (staged), dismissed (user said No, still tracking), truly_dismissed (3 Nos, stop tracking)';

-- ============================================================================
-- 3. ADD INDEX FOR DISMISSED INSIGHTS THAT CAN BE RE-SURFACED
-- ============================================================================

-- Index for finding dismissed insights that might be ready to re-surface
CREATE INDEX IF NOT EXISTS idx_insight_evidence_resurface_candidates
  ON public.insight_evidence(user_id, no_response_count, hits_since_last_no)
  WHERE status = 'dismissed' AND no_response_count < 3;

