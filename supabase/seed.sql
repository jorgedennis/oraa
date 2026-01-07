-- Oraa Database Seed Data
-- Run this after migrations to populate reference data

-- ============================================================================
-- DOMAINS (The 6 core psychological domains for the user's "Map")
-- Per Insights Library Structure v3.0: Mechanism-based organization
-- ============================================================================

insert into public.domains (id, name, icon, display_order) values
  ('beliefs_assumptions', 'Beliefs & Assumptions', '🧭', 1),
  ('emotional_processing', 'Emotional Processing', '💙', 2),
  ('coping_strategies', 'Coping Strategies', '🛡️', 3),
  ('relational_strategies', 'Relational Strategies', '🤝', 4),
  ('somatic_regulation', 'Somatic Regulation', '🫀', 5),
  ('agency_follow_through', 'Agency & Follow-Through', '⚡', 6)
on conflict (id) do update
set name = excluded.name,
    icon = excluded.icon,
    display_order = excluded.display_order;

-- ============================================================================
-- DOMAIN DESCRIPTIONS (for reference, stored in app constants)
-- ============================================================================

-- Beliefs & Assumptions: The fundamental beliefs you hold about yourself, others, and the world
--   - Self-worth, responsibility, safety & threat
--   - Trust & expectations, control & certainty
--   - Fairness & justice, standards & excellence
--
-- Emotional Processing: How emotions are experienced, expressed, avoided, or regulated
--   - Awareness, intensity, expression
--   - Anxiety & threat response, recovery
--
-- Coping Strategies: Actions taken to regulate discomfort or change internal state
--   - Approach vs avoidance, control & structure
--   - Distraction & relief, standards & self-regulation
--   - Reassurance & external support
--
-- Relational Strategies: Observable interpersonal moves in relational contexts
--   - Conflict navigation, closeness regulation, boundary management
--   - Trust development, caretaking patterns, communication patterns
--   - Repair & recovery, validation & approval
--
-- Somatic Regulation: Body states and signals that arise automatically
--   - Arousal, tension, energy
--   - Shutdown, sensory load
--
-- Agency & Follow-Through: How you engage with choice and action
--   - Decision-making, initiation, motivation
--   - Self-trust, follow-through, external structure

