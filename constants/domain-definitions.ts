// Domain and Subdomain Definitions
// From INSIGHTS_LIBRARY_STRUCTURE.md v3.0

export const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  beliefs_assumptions: 'The fundamental beliefs you hold about yourself, others, and the world. This is the lens through which you interpret what happens.',
  emotional_processing: 'How emotions are experienced, expressed, avoided, or regulated. The mechanics of feeling.',
  coping_strategies: 'Actions you take to regulate discomfort or change your internal state. What you do when things feel hard.',
  relational_strategies: 'What you do in interactions with others. Observable interpersonal moves and patterns.',
  somatic_regulation: 'Body states and signals that arise automatically. How stress and emotion show up physically.',
  agency_follow_through: 'How you engage with choice and action. Decision-making, self-trust, and motivation patterns.',
};

export const SUBDOMAIN_DESCRIPTIONS: Record<string, Record<string, string>> = {
  beliefs_assumptions: {
    'Self-Worth': 'How you determine your value and what makes you feel adequate or inadequate.',
    'Responsibility': 'Beliefs about what you\'re accountable for and where blame belongs.',
    'Safety & Threat': 'How you interpret uncertainty, ambiguity, and potential danger.',
    'Trust & Expectations': 'Beliefs about whether people are reliable and what to expect from closeness.',
    'Control & Certainty': 'Beliefs about whether you need to manage situations to prevent problems.',
    'Fairness & Justice': 'Beliefs about reciprocity, merit, and whether outcomes should match effort.',
    'Standards & Excellence': 'Internal benchmarks for performance and what qualifies as acceptable.',
  },
  emotional_processing: {
    'Awareness': 'How easily you access, name, and understand what you\'re feeling.',
    'Intensity': 'How strong emotions feel and how quickly they escalate.',
    'Expression': 'How emotions show up outwardly and whether they get communicated or held inside.',
    'Anxiety & Threat Response': 'Patterns in anxiety, worry, and how your system responds to perceived danger.',
    'Recovery': 'How long emotions linger and what it takes to return to baseline.',
  },
  coping_strategies: {
    'Approach vs Avoidance': 'Whether you move toward or away from difficulty when stressed.',
    'Control & Structure': 'Using organization, planning, and management to reduce anxiety.',
    'Distraction & Relief': 'Shifting attention away from discomfort through external focus.',
    'Standards & Self-Regulation': 'Using perfectionism and self-criticism to manage anxiety about failure.',
    'Reassurance & External Support': 'Seeking validation or confirmation from others to calm doubt.',
  },
  relational_strategies: {
    'Conflict Navigation': 'How you engage with or avoid interpersonal tension and disagreement.',
    'Closeness Regulation': 'Patterns in managing intimacy, distance, and relational intensity.',
    'Boundary Management': 'How boundaries are set, maintained, or eroded in relationships.',
    'Trust Development': 'How trust is built, withheld, or tested over time.',
    'Caretaking Patterns': 'Taking responsibility for others\' emotional states or problems.',
    'Communication Patterns': 'How needs, feelings, and information are expressed or withheld.',
    'Repair & Recovery': 'Post-conflict patterns and reconnection moves.',
    'Validation & Approval': 'Patterns around external validation and approval-seeking.',
  },
  somatic_regulation: {
    'Arousal': 'Activation level of your nervous system and sympathetic response.',
    'Tension': 'Where and how stress shows up as physical holding in the body.',
    'Energy': 'Patterns in vitality, fatigue, and crash cycles.',
    'Shutdown': 'Freeze responses, numbness, and disconnection when overwhelmed.',
    'Sensory Load': 'How your system handles stimulation and overwhelm thresholds.',
  },
  agency_follow_through: {
    'Decision-Making': 'How choices get made and how much confidence exists afterward.',
    'Initiation': 'Whether starting feels easy or difficult and what helps you begin.',
    'Motivation': 'What drives action and how sustainable that drive feels.',
    'Self-Trust': 'How much you trust your own judgment versus seeking external validation.',
    'Follow-Through': 'Patterns in completing what you start and maintaining consistency.',
    'External Structure': 'Dependence on outside accountability, deadlines, or support to act.',
  },
};

export const ROMANCE_MODULE_DESCRIPTION = 'A focused exploration of patterns in romantic relationships and partnerships. A focused exploration of how you show up in romantic contexts.';

export const ROMANCE_SUBDOMAIN_DESCRIPTIONS: Record<string, string> = {
  attachment_security: 'Patterns in how you approach closeness, distance, and security in romantic relationships.',
  intimacy_sex: 'Patterns in physical and sexual connection within romantic relationships.',
  commitment_future: 'How you navigate commitment, future planning, and relationship escalation.',
  jealousy_attention_comparison: 'Patterns in possessiveness, jealousy, and monitoring partner attention.',
  roles_labor_power_balance: 'How partnership responsibilities and power are distributed.',
  conflict_repair_romance: 'How conflict and repair unfold specifically with romantic partners.',
  communication_vulnerability: 'Expressing needs, desires, and feelings specifically with romantic partners.',
  stages_transitions: 'How you navigate different phases of romantic relationships over time.',
};

