-- Oraa Database Seed Data
-- Run this after migrations to populate reference data

-- ============================================================================
-- DOMAINS (The 7 psychological domains for the user's "Map")
-- ============================================================================

insert into public.domains (id, name, icon, display_order) values
  ('inner', 'Inner', '🌀', 1),
  ('emotional', 'Emotional', '💙', 2),
  ('relational', 'Relational', '🤝', 3),
  ('performing', 'Performing', '🎯', 4),
  ('embodied', 'Embodied', '🧘', 5),
  ('temporal', 'Temporal', '⏳', 6),
  ('meaning', 'Meaning', '✨', 7)
on conflict (id) do update
set name = excluded.name,
    icon = excluded.icon,
    display_order = excluded.display_order;

-- ============================================================================
-- DOMAIN DESCRIPTIONS (for reference, stored in app constants)
-- ============================================================================

-- Inner: Self-reflection, inner world, internal processing
-- Emotional: Feelings, emotional patterns, emotional regulation  
-- Relational: Relationships, boundaries, connection with others
-- Performing: Work, achievement, competence, imposter syndrome
-- Embodied: Physical sensations, body awareness, somatic experience
-- Temporal: Past/present/future, memories, life timeline
-- Meaning: Purpose, values, existential questions

