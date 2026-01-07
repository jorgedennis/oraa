#!/usr/bin/env node

/**
 * Seed Insight Templates from JSON
 * 
 * Reads seed_templates.json and inserts:
 * - Categories (subdomains) under core domains
 * - Context modules and subdomains (Romance & Love)
 * - Insight templates with proper category_id references
 * - Template context associations for romance-tagged templates
 * 
 * Usage: node scripts/seed_templates.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables or use defaults
const supabaseUrl = process.env.SUPABASE_URL || 'https://ybpsseqzzhttnbpiqaws.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.error('   Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

// Helper function to make Supabase REST API calls
async function supabaseRequest(table, method = 'GET', body = null, filters = {}) {
  let url = `${supabaseUrl}/rest/v1/${table}`;
  
  // Add filters as query params (Supabase format: column=eq.value)
  const filterParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    filterParams.append(key, `eq.${value}`);
  }
  if (filterParams.toString()) {
    url += '?' + filterParams.toString();
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': method === 'POST' ? 'return=representation' : undefined,
    },
  };

  // Remove undefined headers
  Object.keys(options.headers).forEach(key => {
    if (options.headers[key] === undefined) {
      delete options.headers[key];
    }
  });

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  if (method === 'DELETE' || response.status === 204) {
    return null;
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

// Domain display names mapping (for category creation)
const DOMAIN_DISPLAY_NAMES = {
  'beliefs_assumptions': 'Beliefs & Assumptions',
  'emotional_processing': 'Emotional Processing',
  'coping_strategies': 'Coping Strategies',
  'relational_strategies': 'Relational Strategies',
  'somatic_regulation': 'Somatic Regulation',
  'agency_follow_through': 'Agency & Follow-Through',
};

// Core domain subdomains mapping (from INSIGHTS_LIBRARY_STRUCTURE.md)
const CORE_SUBDOMAINS = {
  'beliefs_assumptions': [
    'Self-Worth',
    'Responsibility',
    'Safety & Threat',
    'Trust & Expectations',
    'Control & Certainty',
    'Fairness & Justice',
    'Standards & Excellence',
  ],
  'emotional_processing': [
    'Awareness',
    'Intensity',
    'Expression',
    'Anxiety & Threat Response',
    'Recovery',
  ],
  'coping_strategies': [
    'Approach vs Avoidance',
    'Control & Structure',
    'Distraction & Relief',
    'Standards & Self-Regulation',
    'Reassurance & External Support',
  ],
  'relational_strategies': [
    'Conflict Navigation',
    'Closeness Regulation',
    'Boundary Management',
    'Trust Development',
    'Caretaking Patterns',
    'Communication Patterns',
    'Repair & Recovery',
    'Validation & Approval',
  ],
  'somatic_regulation': [
    'Arousal',
    'Tension',
    'Energy',
    'Shutdown',
    'Sensory Load',
  ],
  'agency_follow_through': [
    'Decision-Making',
    'Initiation',
    'Motivation',
    'Self-Trust',
    'Follow-Through',
    'External Structure',
  ],
};

// Romance subdomain mapping (slug → name)
const ROMANCE_SUBDOMAINS = {
  'attachment_security': 'Attachment & Security',
  'intimacy_sex': 'Intimacy & Sex',
  'commitment_future': 'Commitment & Future',
  'jealousy_attention_comparison': 'Jealousy, Attention & Comparison',
  'roles_labor_power_balance': 'Roles, Labor & Power Balance',
  'conflict_repair_romance': 'Conflict & Repair (Romance)',
  'communication_vulnerability': 'Communication & Vulnerability',
  'stages_transitions': 'Stages & Transitions',
};

// Romance subdomain slugs from JSON → database slugs
const ROMANCE_SUBDOMAIN_SLUG_MAP = {
  'attachment_security': 'attachment_security',
  'intimacy_sex': 'intimacy_sex',
  'commitment_future': 'commitment_future',
  'jealousy_attention_comparison': 'jealousy_attention_comparison',
  'roles_labor_power_balance': 'roles_labor_power_balance',
  'conflict_repair_romance': 'conflict_repair_romance',
  'communication_vulnerability': 'communication_vulnerability',
  'stages_transitions': 'stages_transitions',
};

async function main() {
  console.log('🌱 Starting template seed process...\n');

  // Load JSON file
  const jsonPath = path.join(__dirname, '..', 'seed_templates.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: seed_templates.json not found at ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`📄 Loaded ${data.templates.length} templates from JSON\n`);

  // Step 1: Ensure domains exist
  console.log('1️⃣ Checking domains...');
  for (const domainInfo of data.metadata.domains) {
    const domains = await supabaseRequest('domains', 'GET', null, { id: domainInfo.id });
    
    if (!domains || domains.length === 0) {
      console.error(`❌ Domain ${domainInfo.id} not found. Run seed.sql first!`);
      process.exit(1);
    }
  }
  console.log('   ✅ All domains exist\n');

  // Step 2: Create categories (subdomains) for core domains
  console.log('2️⃣ Creating categories (subdomains)...');
  const categoryMap = {}; // category name → category_id

  for (const [domainId, subdomains] of Object.entries(CORE_SUBDOMAINS)) {
    for (let i = 0; i < subdomains.length; i++) {
      const subdomainName = subdomains[i];
      const slug = subdomainName.toLowerCase().replace(/\s+/g, '_').replace(/[&()]/g, '');

      // Check if category exists
      let categories = await supabaseRequest('insight_categories', 'GET', null, { 
        domain_id: domainId,
        slug: slug 
      });
      
      let category = categories && categories.length > 0 ? categories[0] : null;

      if (!category) {
        // Create category
        try {
          const newCategories = await supabaseRequest('insight_categories', 'POST', {
            domain_id: domainId,
            slug: slug,
            name: subdomainName,
            display_order: i,
          });
          
          category = newCategories[0];
          console.log(`   ✅ Created: ${domainId} → ${subdomainName}`);
        } catch (error) {
          console.error(`❌ Error creating category ${subdomainName}:`, error.message);
          process.exit(1);
        }
      }

      categoryMap[subdomainName] = category.id;
    }
  }
  console.log(`   ✅ Created/found ${Object.keys(categoryMap).length} categories\n`);

  // Step 3: Create Romance & Love context module
  console.log('3️⃣ Creating Romance & Love context module...');
  
  let modules = await supabaseRequest('context_modules', 'GET', null, { slug: 'romance_love' });
  let romanceModule = modules && modules.length > 0 ? modules[0] : null;

  if (!romanceModule) {
    try {
      const newModules = await supabaseRequest('context_modules', 'POST', {
        slug: 'romance_love',
        name: 'Romance & Love',
        description: 'Patterns in romantic relationships and partnerships',
        display_order: 1,
        is_active: true,
      });
      
      romanceModule = newModules[0];
      console.log('   ✅ Created Romance & Love module');
    } catch (error) {
      console.error('❌ Error creating Romance module:', error.message);
      process.exit(1);
    }
  } else {
    console.log('   ✅ Romance & Love module exists');
  }

  // Step 4: Create romance subdomains
  console.log('4️⃣ Creating romance subdomains...');
  const romanceSubdomainMap = {}; // slug → subdomain_id

  for (let i = 0; i < Object.keys(ROMANCE_SUBDOMAINS).length; i++) {
    const slug = Object.keys(ROMANCE_SUBDOMAINS)[i];
    const name = ROMANCE_SUBDOMAINS[slug];

    let subdomains = await supabaseRequest('context_subdomains', 'GET', null, {
      context_module_id: romanceModule.id,
      slug: slug
    });
    
    let subdomain = subdomains && subdomains.length > 0 ? subdomains[0] : null;

    if (!subdomain) {
      try {
        const newSubdomains = await supabaseRequest('context_subdomains', 'POST', {
          context_module_id: romanceModule.id,
          slug: slug,
          name: name,
          display_order: i,
        });
        
        subdomain = newSubdomains[0];
        console.log(`   ✅ Created: ${name}`);
      } catch (error) {
        console.error(`❌ Error creating romance subdomain ${name}:`, error.message);
        process.exit(1);
      }
    }

    romanceSubdomainMap[slug] = subdomain.id;
  }
  console.log(`   ✅ Created/found ${Object.keys(romanceSubdomainMap).length} romance subdomains\n`);

  // Step 5: Insert templates
  console.log('5️⃣ Inserting templates...');
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const template of data.templates) {
    try {
      // Get category_id
      const categoryId = categoryMap[template.category];
      if (!categoryId) {
        console.error(`❌ Category "${template.category}" not found for template ${template.slug}`);
        errors++;
        continue;
      }

      // Check if template already exists
      const existing = await supabaseRequest('insight_templates', 'GET', null, { slug: template.slug });

      if (existing && existing.length > 0) {
        console.log(`   ⏭️  Skipped (exists): ${template.slug}`);
        skipped++;
        continue;
      }

      // Insert template
      let newTemplate;
      try {
        const newTemplates = await supabaseRequest('insight_templates', 'POST', {
          slug: template.slug,
          insight_text: template.insight_text,
          domain_id: template.domain,
          category_id: categoryId,
          subcategory: template.subcategory || null,
          subtype: template.subtype || null,
          search_variants: template.search_variants || [],
          search_keywords: template.search_keywords || [],
          prevalence: template.prevalence || 'common',
          is_active: true,
        });
        
        newTemplate = newTemplates[0];
      } catch (insertError) {
        console.error(`❌ Error inserting ${template.slug}:`, insertError.message);
        errors++;
        continue;
      }

      inserted++;
      if (inserted % 10 === 0) {
        console.log(`   ✅ Inserted ${inserted} templates...`);
      }

      // Step 6: Create romance context associations if tagged
      if (template.context_tags?.romantic_context) {
        const romanceSubdomainSlug = template.context_tags.romance_subdomain;
        const romanceSubdomainId = romanceSubdomainMap[romanceSubdomainSlug];

        if (romanceSubdomainId) {
          try {
            await supabaseRequest('template_contexts', 'POST', {
              template_id: newTemplate.id,
              context_module_id: romanceModule.id,
              context_subdomain_id: romanceSubdomainId,
              is_exclusive: template.context_tags.is_romance_exclusive || false,
              relevance_level: 'primary',
            });
          } catch (error) {
            console.warn(`   ⚠️  Warning: Could not create romance context for ${template.slug}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${template.slug}:`, error.message);
      errors++;
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (already exist): ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n💡 Note: Embeddings will be generated separately`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

