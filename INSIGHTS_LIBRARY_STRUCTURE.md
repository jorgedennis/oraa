# Oraa Insights Library: Complete Domain Structure v3.0

**Version:** 3.0 - LOCKED  
**Date:** January 2025  
**Status:** Canonical - Includes Romance & Love Context Module

---

## The Two-Module Architecture

Oraa's Map organizes insights using **two complementary views**: one organized by mechanism (how patterns work), one organized by context (where they show up). This dual approach keeps the backend technically clean while meeting users where they actually think about their lives.

### Module 1: Core Domains (Mechanism View)

**What it is:** The canonical 6 domains organized by operational mechanism - how patterns function psychologically.

**Purpose:** This is Oraa's "self-knowledge library" - the comprehensive view of who you are across all contexts. Insights are classified here by their primary psychological mechanism (belief, emotion, coping move, relational strategy, body state, or agency pattern).

**User experience:** Users browse these when exploring themselves holistically - "how do I operate in the world?" These domains are always visible and feel like chapters in understanding yourself.

**Why mechanism-based:** Organizing by mechanism prevents duplicate insights, enables reliable re-detection, and keeps advice portable across different life contexts. A pattern like "you withdraw when things feel intense" works the same way whether it shows up with a partner, parent, or colleague.

---

### Module 2: Romance & Love (Context View)

**What it is:** A curated "deep dive" section that pulls together romance-specific insights and organizes them by romantic relationship dynamics.

**Purpose:** Romantic relationships are a primary use case for Oraa, and users think contextually ("what's happening in my relationship?") not mechanistically ("what are my relational strategies?"). This module meets that mental model while using relationship-specific language like attachment, intimacy, commitment, and jealousy.

**User experience:** Users access this when focused on romantic relationship patterns - "I want to understand my relationship." It feels like a focused exploration of romantic dynamics rather than a general self-knowledge exercise.

**Why separate:** Romance has unique dynamics (sexual intimacy, commitment anxiety, attachment patterns, jealousy) that deserve focused attention with specific language. Making this a separate module allows clinical precision (attachment styles, intimacy patterns) without making the core domains feel diagnostic.

---

## How Insights Flow Between Modules

### Cross-Context Insights (70% of Romance module)

**What they are:** Insights that apply broadly but are especially relevant to romantic relationships.

**Example:** "You pull back when closeness feels too intense"

**Where it lives:**
- **Primary home:** Core Domains → Relational Strategies → Closeness Regulation
- **Also appears in:** Romance & Love → Attachment & Security

**Detection:** Detected through normal mechanism-based detection. Gets tagged for Romance module based on:
- Conversation thread context (user discussing romantic relationship)
- Pre-defined romance relevance in template metadata
- Content signals indicating romantic context

**Advice:** Base advice applies to all relationships. When viewed in Romance module, additional romance-specific examples are shown ("In romantic partnerships, this might look like pulling away after a weekend together...").

**Why cross-context:** Many relational patterns aren't exclusive to romance - they show up with family, friends, colleagues. But users experiencing them in romantic contexts need to see them in that frame.

### Romance-Exclusive Insights (30% of Romance module)

**What they are:** Insights that only make sense in romantic relationship contexts.

**Example:** "You struggle to initiate sexual intimacy even when you want it"

**Where it lives:**
- **Primary home:** Still gets a mechanism domain assignment (likely Relational Strategies or Coping Strategies for technical consistency)
- **Appears only in:** Romance & Love → Intimacy & Sex
- **Hidden from:** Core mechanism view (users don't see it there)

**Detection:** Detected when conversation signals romance context. Template is flagged as `is_exclusive: true` so it never surfaces outside Romance module.

**Advice:** Entirely romance-specific - no need for generalized framing since it only applies to romantic contexts.

**Why exclusive:** Some dynamics (sexual intimacy, commitment fears, jealousy patterns) are unique to romantic relationships. These templates use language that wouldn't make sense in the general mechanism view.

### Technical Implementation

**Database structure:**
- Each template has ONE primary mechanism domain (canonical classification)
- Templates can be tagged for multiple context modules via join table
- `template_contexts` table links templates to Romance module with:
  - Which romance subdomain it belongs to
  - Whether it's primary or secondary relevance
  - Whether it's exclusive to that context

**User sees:**
- Core Domains: All non-exclusive insights organized by mechanism
- Romance Module: Mix of cross-context + romance-exclusive insights organized by romantic dynamics

**Example flow:**

Template created: "You monitor your partner's attention to other people"
→ Mechanism assignment: Relational Strategies (or Beliefs & Assumptions)
→ Romance context: YES, subdomain = "Jealousy, Attention & Comparison", is_exclusive = true
→ User in Core Domains view: Does NOT see this insight
→ User in Romance module: DOES see this insight under Jealousy category

---

## Strategy & Principles

### Why This Architecture Works

1. **Clean backend ontology:** Mechanism domains prevent collisions and enable reliable re-detection
2. **Intuitive user experience:** Users navigate by life context when that's their focus
3. **Scalable:** Can add Family Dynamics or Work & Career modules using same pattern
4. **Marketing clarity:** "Oraa helps you understand your relationships" is a visible, navigable feature
5. **No duplication:** Same insight exists once in database, appears in multiple views when relevant

### Guiding Principles

**For Core Domains:**
- Organize by mechanism (how it works)
- Use neutral, non-clinical language
- Insights work across all life contexts
- Always visible, comprehensive view of self

**For Romance Module:**
- Organize by romantic dynamics (what area of relationships)
- Can use relationship-specific language (attachment, intimacy, commitment)
- Insights are romance-relevant or romance-exclusive
- Feels like focused relationship exploration

**For Cross-Context Insights:**
- Default to showing in BOTH places when relevant
- Frame differently for each context
- Let thread/conversation context guide which view surfaces them

**For Template Authoring:**
- Every template gets a mechanism domain assignment (required)
- Romance tagging is additive (optional but encouraged when relevant)
- Exclusive flag only for truly romance-only dynamics
- Aim for 70/30 split (cross-context / exclusive)

---

# Core Domains (Module 1)

## 1. Beliefs & Assumptions
*The fundamental beliefs you hold about yourself, others, and the world - the lens through which you interpret what happens.*

### Self-Worth
How you determine your value and what makes you feel adequate or inadequate. Includes beliefs about conditional worth, comparison to others, and what you need to be "enough."

### Responsibility
Beliefs about what you're accountable for and where blame belongs. Includes patterns of over-responsibility, hindsight blame, and control as prevention.

### Safety & Threat
How you interpret uncertainty, ambiguity, and potential danger. Includes worst-case thinking, vigilance patterns, and what triggers a sense of safety or risk.

### Trust & Expectations
Beliefs about whether people are reliable and what to expect from closeness. Includes assumptions about disappointment, betrayal, and whether vulnerability is safe.

### Control & Certainty
Beliefs about whether you need to manage situations to prevent problems. Includes planning as security, delegation mistrust, and feelings about spontaneity.

### Fairness & Justice
Beliefs about reciprocity, merit, and whether outcomes should match effort. Includes scorekeeping patterns, comparison to others' advantages, and recognition expectations.

### Standards & Excellence
Internal benchmarks for performance and what qualifies as acceptable. Includes moving goalposts, mistake intolerance, and whether "good enough" feels like settling.

---

## 2. Emotional Processing
*How emotions are experienced, expressed, avoided, or regulated - the mechanics of feeling.*

### Awareness
How easily you access, name, and understand what you're feeling. Includes connection between body signals and emotions, and timing of emotional recognition.

### Intensity
How strong emotions feel and how quickly they escalate. Includes spike patterns, overwhelm thresholds, and whether feelings hit like a wave or build gradually.

### Expression
How emotions show up outwardly and whether they get communicated or held inside. Includes crying accessibility, display of specific emotions like anger or sadness, and expression comfort.

### Anxiety & Threat Response
Patterns in anxiety, worry, and how your system responds to perceived danger. Includes anticipatory anxiety, panic patterns, and baseline nervous energy.

### Recovery
How long emotions linger and what it takes to return to baseline. Includes bounce-back time, regulation strategies that help or don't, and residue that stays after the trigger passes.

---

## 3. Coping Strategies
*Behavioral, attentional, or interpersonal moves that change internal state - actions taken to regulate discomfort.*

### Approach vs Avoidance
Whether you move toward or away from difficulty when stressed. Includes fixing and over-functioning patterns as well as delay, withdrawal, and postponement moves.

### Control & Structure
Using organization, planning, and management to reduce anxiety. Includes detail focus, contingency preparation, and needing everything arranged to feel calm.

### Distraction & Relief
Shifting attention away from discomfort through external focus. Includes scrolling, staying busy, substances, and mentally checking out when things feel heavy.

### Standards & Self-Regulation
Using perfectionism and self-criticism to manage anxiety about failure. Includes error prevention, redoing patterns, and raising the bar to feel in control.

### Reassurance & External Support
Seeking validation or confirmation from others to calm doubt. Includes checking behaviors, asking if things are okay, and needing external input to trust decisions.

---

## 4. Relational Strategies
*Observable interpersonal moves people make in relational contexts - what you do in interactions with others.*

### Conflict Navigation
How you engage with or avoid interpersonal tension and disagreement. Includes smoothing, withdrawal, rushing to resolution, defensiveness, and delayed processing.

### Closeness Regulation
Patterns in managing intimacy, distance, and relational intensity. Includes pulling back when things feel too close, testing commitment, sharing patterns, and space needs.

### Boundary Management
How boundaries are set, maintained, or eroded in relationships. Includes accommodation, saying yes then resenting it, need suppression, and guilt about setting limits.

### Trust Development
How trust is built, withheld, or tested over time. Includes proof-seeking, pacing of disclosure, reliability testing, and selective sharing patterns.

### Caretaking Patterns
Taking responsibility for others' emotional states or problems. Includes mood monitoring, fixing for others' comfort, priority inversion, and managing your own reactions to protect others.

### Communication Patterns
How needs, feelings, and information are expressed or withheld. Includes directness vs hinting, expectations of mind-reading, intellectualized sharing, and processing time needs.

### Repair & Recovery
Post-conflict patterns and reconnection moves. Includes space needs before repair, apology patterns, who initiates reconnection, and how completely hurt gets processed.

### Validation & Approval
Patterns around external validation and approval-seeking. Includes confirmation checking, performing for acceptance, perception monitoring, and comfort with receiving compliments.

---

## 5. Somatic Regulation
*Body states, signals, or nervous-system shifts that arise and persist - involuntary physiological responses.*

### Arousal
Activation level of your nervous system and sympathetic response. Includes hypervigilance states, fight-or-flight activation, and running on high alert.

### Tension
Where and how stress shows up as physical holding in the body. Includes jaw, shoulders, chest tightness, and chronic muscular patterns that persist even at rest.

### Energy
Patterns in vitality, fatigue, and crash cycles. Includes adrenaline-driven pushes, energy depletion, burnout patterns, and recovery difficulty.

### Shutdown
Parasympathetic collapse, freeze, and disconnection responses. Includes numbness, fog states, dissociation, and the body going offline under stress.

### Sensory Load
How your system handles stimulation and overwhelm thresholds. Includes sensitivity to sound, light, touch, crowding, and when environment becomes too much.

---

## 6. Agency & Follow-Through
*Decision-making, self-trust, initiation, and motivation patterns - how you engage with choice and action.*

### Decision-Making
How choices get made and how much confidence exists afterward. Includes second-guessing, analysis paralysis, reopening closed decisions, and certainty requirements before committing.

### Initiation
Whether starting feels easy or difficult and what helps you begin. Includes resistance to starting, needing the right conditions, momentum requirements, and passive waiting patterns.

### Motivation
What drives action and how sustainable that drive feels. Includes intrinsic vs extrinsic drivers, motivation fluctuation, and what happens when motivation drops.

### Self-Trust
How much you trust your own judgment versus seeking external validation. Includes doubt in your own decisions, deference to authority, and questioning your assessment after choosing.

### Follow-Through
Patterns in completing what you start and maintaining consistency. Includes abandonment patterns, finishing resistance, commitment maintenance, and what helps or hinders completion.

### External Structure
Dependence on outside accountability, deadlines, or support to act. Includes needing external pressure, structure dependence, difficulty with self-direction, and what happens without external scaffolding.

---

# Romance & Love Module (Module 2)

*A focused exploration of patterns in romantic relationships and partnerships - organized by romantic dynamics rather than psychological mechanism.*

**Module philosophy:** Users think "what's happening in my relationship?" not "what are my relational strategies?" This module meets that mental model by organizing insights around romantic relationship experiences: attachment, intimacy, commitment, jealousy, partnership dynamics, conflict with partners, communication in romance, and relationship transitions.

**Language approach:** Can use relationship-specific clinical terms (attachment styles, intimacy patterns) that would feel too diagnostic in the core mechanism view. Insights here are framed for romantic contexts specifically.

**Content mix:** ~70% cross-context insights (also appear in Core Domains) + ~30% romance-exclusive insights (only visible here).

---

## 1. Attachment & Security
*Patterns in how you approach closeness, distance, and security in romantic relationships.*

Includes anxious attachment moves (monitoring, seeking reassurance, fear of abandonment), avoidant patterns (creating distance when things feel intense, independence over connection), secure relating (comfortable with closeness and autonomy), and disorganized patterns (push-pull dynamics, craving and fearing intimacy simultaneously). This subdomain focuses on your fundamental approach to romantic bonds and what makes you feel safe or threatened in partnerships.

**Example insights:**
- "You pull back when relationships start feeling too intense" (cross-context)
- "You monitor your partner's mood and adjust your behavior to keep them close" (cross-context)
- "You need regular space from your partner to feel like yourself" (cross-context)

---

## 2. Intimacy & Sex
*Patterns in physical and sexual connection within romantic relationships.*

Includes sexual initiation patterns, desire discrepancies, vulnerability during physical intimacy, performance anxiety, body image in intimate contexts, mismatched libidos, and comfort with sexual communication. This subdomain addresses physical and sexual dimensions of romantic relationships that don't appear in general relational patterns.

**Example insights:**
- "You struggle to initiate sexual intimacy even when you want it" (romance-exclusive)
- "Physical intimacy feels vulnerable in ways emotional intimacy doesn't" (romance-exclusive)
- "You withdraw physically when emotionally disconnected" (romance-exclusive)

---

## 3. Commitment & Future
*Patterns in how you navigate commitment, future planning, and relationship escalation.*

Includes commitment anxiety, future planning avoidance, escalation fears, timelines and pressure, marriage/cohabitation resistance, long-term thinking difficulty, and fear of being trapped. This subdomain captures patterns specific to romantic relationship milestones and deepening commitment that don't apply to friendships or family bonds.

**Example insights:**
- "You feel anxious when conversations turn to the future" (romance-exclusive)
- "You're all-in at the beginning, then pull back when things get serious" (romance-exclusive)
- "You need to maintain escape routes even in committed relationships" (romance-exclusive)

---

## 4. Jealousy, Attention & Comparison
*Patterns in possessiveness, jealousy, and monitoring partner attention.*

Includes jealousy triggers, attention monitoring, comparison to exes or others, possessiveness patterns, insecurity about partner's attraction to others, tracking behaviors, and suspicion patterns. This subdomain addresses dynamics unique to romantic exclusivity and the specific vulnerabilities that arise in romantic contexts.

**Example insights:**
- "You monitor your partner's attention to other people" (romance-exclusive)
- "You compare yourself to your partner's exes" (romance-exclusive)
- "You need regular reassurance about your partner's attraction to you" (romance-exclusive)

---

## 5. Roles, Labor & Power Balance
*Patterns in how partnership responsibilities and power are distributed.*

Includes caretaker roles, emotional labor distribution, decision-making power, financial dynamics, domestic labor patterns, pursuer-distancer dynamics, and who manages the relationship. This subdomain focuses on partnership-specific role negotiations that differ from general caretaking patterns.

**Example insights:**
- "You take on the 'responsible one' role in partnerships" (cross-context, romance-framed)
- "You manage the relationship calendar and emotional maintenance" (romance-exclusive)
- "You defer to your partner's preferences to avoid conflict" (cross-context, romance-framed)

---

## 6. Conflict & Repair (Romance)
*Patterns in how conflict and repair unfold specifically with romantic partners.*

Includes partner-specific conflict patterns, criticism sensitivity in romantic contexts, repair after fights with partners, vulnerability during conflict with partners, and how relationship-specific triggers (jealousy, commitment, intimacy) create unique conflict dynamics. While conflict patterns exist generally, romantic conflict has unique intensity and stakes.

**Example insights:**
- "You shut down when your partner criticizes you" (cross-context, romance-framed)
- "You bring up past issues when fighting about current ones" (romance-exclusive)
- "You need days of space before you can reconnect after a fight" (cross-context, romance-framed)

---

## 7. Communication & Vulnerability
*Patterns in expressing needs, desires, and feelings specifically with romantic partners.*

Includes need expression with partners, expectations in romantic contexts, vulnerability pacing in romance, sexual communication, discussing relationship concerns, asking for what you want romantically, and disclosure timing in partnerships. Romantic communication has unique vulnerability (rejection by someone you love) that differs from general communication patterns.

**Example insights:**
- "You expect your partner to know what you need without saying it" (cross-context, romance-framed)
- "You struggle to ask for what you want sexually" (romance-exclusive)
- "You hint at relationship concerns rather than addressing them directly" (cross-context, romance-framed)

---

## 8. Stages & Transitions
*Patterns in how you navigate different phases of romantic relationships.*

Includes dating patterns, early relationship intensity, moving from casual to committed, cohabitation transitions, long-term maintenance patterns, relationship plateaus, and adaptation to change. This subdomain captures how patterns shift across relationship stages and the specific challenges of romantic relationship evolution.

**Example insights:**
- "You're intensely connected at the beginning, then pull back over time" (romance-exclusive)
- "You struggle when the honeymoon phase ends" (romance-exclusive)
- "You create distance during major relationship transitions" (cross-context, romance-framed)

---

## Structure Summary

| Module | Domains/Categories | Subdomains | Target Templates |
|--------|-------------------|------------|------------------|
| **Core Domains** | 6 domains | 36 subdomains | 2,000-2,500 |
| **Romance & Love** | 1 module | 8 subdomains | 150-250 |

**Romance template breakdown:**
- Cross-context (appear in both): ~105-175 templates (70%)
- Romance-exclusive (Romance only): ~45-75 templates (30%)

---

## Navigation & User Experience

### Map Layout

```
┌─────────────────────────────────────┐
│         Deep Dives                  │
│  ┌──────────────────────┐          │
│  │  Romance & Love      │          │
│  │  [View relationship  │          │
│  │   patterns]          │          │
│  └──────────────────────┘          │
│                                     │
│  [Future: Family Dynamics]         │
│  [Future: Work & Career]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     Your Map - Core Domains         │
│                                     │
│  Beliefs & Assumptions: 5 insights  │
│  Emotional Processing: 3 insights   │
│  Coping Strategies: 7 insights      │
│  Relational Strategies: 12 insights │
│  Somatic Regulation: 2 insights     │
│  Agency & Follow-Through: 4 insights│
└─────────────────────────────────────┘
```

### When Users See Romance Module

**Appears when:**
- User has romance-relevant insights detected
- User is in a romance-focused thread
- User explores from chat prompt ("Want to explore this through Romance & Love?")

**Does not appear when:**
- User has no romance-tagged insights yet
- Can be hidden/shown via settings

### How Same Insight Appears in Both Places

**Template:** "You pull back when closeness feels too intense"

**In Core Domains (Relational Strategies → Closeness Regulation):**
- Listed among other closeness regulation patterns
- Insight text unchanged
- Advice shows general framing (applies to all relationships)

**In Romance Module (Attachment & Security):**
- Listed among other attachment patterns
- Insight text unchanged
- Advice shows general framing PLUS romance-specific examples added
- May have romance-specific framing in subdomain description

---

## Implementation Notes

### Database Schema

**Core tables (unchanged):**
- `insight_templates` - The full library with mechanism domain assignment
- `insights` - User's confirmed insights
- `staging_queue` - Pending insights

**New tables for context modules:**
- `context_modules` - Defines each module (Romance & Love, Future: Family, etc.)
- `context_subdomains` - Subdomains within each module
- `template_contexts` - Many-to-many join linking templates to context modules
- `insight_template_advice_overlays` - Context-specific advice additions

### Detection Flow

1. **Run normal mechanism detection** (unchanged - hybrid retrieval + LLM selection)
2. **After template selection**, assign context:
   - Check conversation thread (is user discussing romance?)
   - Check template's context mappings (is this romance-relevant?)
   - Optional: Run small classifier to assign romance subdomain (8 options, cheap)
3. **If romance context detected**, create association for Romance module view

### Advice Rendering

1. **Load base advice** from `insight_template_advice` (always shown)
2. **If viewing in Romance module**, append overlays from `insight_template_advice_overlays`
3. Romance overlays add sections like "In romantic relationships, this might look like..."

---

## Change Control

### Core Domains Structure
**Status:** LOCKED as of v3.0  
**Changes require:** Evidence of collision problems, user feedback, impact analysis, migration plan

### Romance Module Structure  
**Status:** LOCKED as of v3.0  
**Changes require:** User feedback on navigation, subdomain relevance data, usage patterns

### Future Context Modules
**Planned:** Family Dynamics, Work & Career  
**Timeline:** After Romance module proves pattern (6-12 months post-launch)  
**Approach:** Clone Romance module architecture, adapt subdomains to context

---

*This document serves as the canonical reference for Oraa's dual-module architecture, encompassing both mechanism-based and context-based organization of insights.*

---

# User-Facing Definitions

*These are the simple, clear definitions users see when browsing the Map. No examples, no technical detail - just what each category means.*

---

## Core Domains

### 1. Beliefs & Assumptions
The fundamental beliefs you hold about yourself, others, and the world. This is the lens through which you interpret what happens.

**1a. Self-Worth**  
How you determine your value and what makes you feel adequate or inadequate.

**1b. Responsibility**  
Beliefs about what you're accountable for and where blame belongs.

**1c. Safety & Threat**  
How you interpret uncertainty, ambiguity, and potential danger.

**1d. Trust & Expectations**  
Beliefs about whether people are reliable and what to expect from closeness.

**1e. Control & Certainty**  
Beliefs about whether you need to manage situations to prevent problems.

**1f. Fairness & Justice**  
Beliefs about reciprocity, merit, and whether outcomes should match effort.

**1g. Standards & Excellence**  
Internal benchmarks for performance and what qualifies as acceptable.

---

### 2. Emotional Processing
How emotions are experienced, expressed, avoided, or regulated. The mechanics of feeling.

**2a. Awareness**  
How easily you access, name, and understand what you're feeling.

**2b. Intensity**  
How strong emotions feel and how quickly they escalate.

**2c. Expression**  
How emotions show up outwardly and whether they get communicated or held inside.

**2d. Anxiety & Threat Response**  
Patterns in anxiety, worry, and how your system responds to perceived danger.

**2e. Recovery**  
How long emotions linger and what it takes to return to baseline.

---

### 3. Coping Strategies
Actions you take to regulate discomfort or change your internal state. What you do when things feel hard.

**3a. Approach vs Avoidance**  
Whether you move toward or away from difficulty when stressed.

**3b. Control & Structure**  
Using organization, planning, and management to reduce anxiety.

**3c. Distraction & Relief**  
Shifting attention away from discomfort through external focus.

**3d. Standards & Self-Regulation**  
Using perfectionism and self-criticism to manage anxiety about failure.

**3e. Reassurance & External Support**  
Seeking validation or confirmation from others to calm doubt.

---

### 4. Relational Strategies
What you do in interactions with others. Observable interpersonal moves and patterns.

**4a. Conflict Navigation**  
How you engage with or avoid interpersonal tension and disagreement.

**4b. Closeness Regulation**  
Patterns in managing intimacy, distance, and relational intensity.

**4c. Boundary Management**  
How boundaries are set, maintained, or eroded in relationships.

**4d. Trust Development**  
How trust is built, withheld, or tested over time.

**4e. Caretaking Patterns**  
Taking responsibility for others' emotional states or problems.

**4f. Communication Patterns**  
How needs, feelings, and information are expressed or withheld.

**4g. Repair & Recovery**  
Post-conflict patterns and reconnection moves.

**4h. Validation & Approval**  
Patterns around external validation and approval-seeking.

---

### 5. Somatic Regulation
Body states and signals that arise automatically. How stress and emotion show up physically.

**5a. Arousal**  
Activation level of your nervous system and sympathetic response.

**5b. Tension**  
Where and how stress shows up as physical holding in the body.

**5c. Energy**  
Patterns in vitality, fatigue, and crash cycles.

**5d. Shutdown**  
Freeze responses, numbness, and disconnection when overwhelmed.

**5e. Sensory Load**  
How your system handles stimulation and overwhelm thresholds.

---

### 6. Agency & Follow-Through
How you engage with choice and action. Decision-making, self-trust, and motivation patterns.

**6a. Decision-Making**  
How choices get made and how much confidence exists afterward.

**6b. Initiation**  
Whether starting feels easy or difficult and what helps you begin.

**6c. Motivation**  
What drives action and how sustainable that drive feels.

**6d. Self-Trust**  
How much you trust your own judgment versus seeking external validation.

**6e. Follow-Through**  
Patterns in completing what you start and maintaining consistency.

**6f. External Structure**  
Dependence on outside accountability, deadlines, or support to act.

---

## Romance & Love Module

Patterns in romantic relationships and partnerships. A focused exploration of how you show up in romantic contexts.

**R1. Attachment & Security**  
How you approach closeness, distance, and security in romantic relationships.

**R2. Intimacy & Sex**  
Patterns in physical and sexual connection within romantic relationships.

**R3. Commitment & Future**  
How you navigate commitment, future planning, and relationship escalation.

**R4. Jealousy, Attention & Comparison**  
Patterns in possessiveness, jealousy, and monitoring partner attention.

**R5. Roles, Labor & Power Balance**  
How partnership responsibilities and power are distributed.

**R6. Conflict & Repair (Romance)**  
How conflict and repair unfold specifically with romantic partners.

**R7. Communication & Vulnerability**  
Expressing needs, desires, and feelings specifically with romantic partners.

**R8. Stages & Transitions**  
How you navigate different phases of romantic relationships over time.

---

*These definitions appear in the UI when users browse domains and subdomains. They provide just enough context to understand what each category covers without overwhelming detail.*

