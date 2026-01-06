-- Oraa Database Seed Data
-- Run this after migrations to populate reference data

-- ============================================================================
-- DOMAINS (The 5 psychological domains for the user's "Map")
-- Per product spec: Relational, Emotional, Cognitive, Somatic, Behavioral
-- ============================================================================

insert into public.domains (id, name, icon, display_order) values
  ('relational', 'Relational', '🤝', 1),
  ('emotional', 'Emotional', '💙', 2),
  ('cognitive', 'Cognitive', '🧠', 3),
  ('somatic', 'Somatic', '🫀', 4),
  ('behavioral', 'Behavioral', '⚡', 5)
on conflict (id) do update
set name = excluded.name,
    icon = excluded.icon,
    display_order = excluded.display_order;

-- ============================================================================
-- DOMAIN DESCRIPTIONS (for reference, stored in app constants)
-- ============================================================================

-- Relational: Patterns in how you connect with others
--   - How you relate to people
--   - Boundaries, attachment styles
--   - Communication patterns in relationships
--
-- Emotional: Patterns in how you experience and process feelings
--   - Emotional triggers and responses
--   - How you handle difficult emotions
--   - Emotional regulation patterns
--
-- Cognitive: Patterns in how you think and make decisions
--   - Thought patterns and loops
--   - Decision-making tendencies
--   - Beliefs and assumptions
--
-- Somatic: Patterns in how emotions manifest physically
--   - Body sensations and emotions
--   - Physical stress responses
--   - Mind-body connection
--
-- Behavioral: Patterns in what you do under certain conditions
--   - Habitual responses
--   - Coping mechanisms
--   - Action tendencies

