/**
 * Quick Domain Packs Ingestion
 * Simplified version with hardcoded data for reliability
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ 
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}

// Hardcoded high-priority items from each domain
const domainItems = [
  // Marketing Mental Models
  {
    domain: 'MARKETING',
    type: 'mental_model',
    name: 'Jobs-to-be-Done',
    content: 'Jobs-to-be-Done: Understand what job the customer hires you for.',
    stage_tags: ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
    domain_tags: ['Marketing', 'GTM']
  },
  {
    domain: 'MARKETING',
    type: 'mental_model',
    name: 'Funnel Thinking',
    content: 'Funnel Thinking: Awareness → Interest → Desire → Action.',
    stage_tags: ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
    domain_tags: ['Marketing', 'GTM']
  },
  {
    domain: 'MARKETING',
    type: 'mental_model',
    name: 'Pain Pyramid',
    content: 'Pain Pyramid: Sell to the highest pains first.',
    stage_tags: ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
    domain_tags: ['Marketing', 'GTM']
  },
  
  // GTM Frameworks
  {
    domain: 'GTM',
    type: 'framework',
    name: 'Pain → Promise → Proof → Product',
    content: 'Pain → Promise → Proof → Product: The simplest high-conversion messaging flow.',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['GTM', 'Strategy']
  },
  {
    domain: 'GTM',
    type: 'framework',
    name: 'The GTM Pyramid',
    content: 'The GTM Pyramid: ICP → Pain → Positioning → Messaging → Channel → Offer.',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['GTM', 'Strategy']
  },
  {
    domain: 'GTM',
    type: 'principle',
    name: 'GTM is 80% who and 20% how',
    content: 'GTM is 80% "who" and 20% "how."',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['GTM', 'Strategy']
  },
  
  // Sales Frameworks
  {
    domain: 'SALES',
    type: 'framework',
    name: 'Discovery Framework (PEEL Method)',
    content: 'Discovery Framework (PEEL Method): Problem → Emotion → Effect → Loss (cost of inaction)',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Sales', 'GTM']
  },
  {
    domain: 'SALES',
    type: 'principle',
    name: 'Discovery > Demo',
    content: 'Discovery > Demo. Great discovery calls make demos unnecessary.',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Sales', 'GTM']
  },
  
  // Product/Tech
  {
    domain: 'TECH & PRODUCT',
    type: 'principle',
    name: 'Build the simplest version',
    content: 'Build the simplest version that solves the core problem.',
    stage_tags: ['idea', 'validation', 'mvp', 'first_customers', 'early_revenue', 'pmf'],
    domain_tags: ['Product', 'Tech']
  },
  {
    domain: 'TECH & PRODUCT',
    type: 'framework',
    name: 'Musk\'s 5-Step Engineering Process',
    content: 'Musk\'s 5-Step Engineering Process: 1. Question requirements 2. Delete, delete, delete 3. Simplify 4. Accelerate 5. Automate last',
    stage_tags: ['idea', 'validation', 'mvp', 'first_customers', 'early_revenue', 'pmf'],
    domain_tags: ['Product', 'Tech']
  },
  
  // Operations
  {
    domain: 'OPERATIONS',
    type: 'principle',
    name: 'Systems > talent',
    content: 'Systems > talent. You cannot scale a startup that depends on individual heroics.',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Ops']
  },
  {
    domain: 'OPERATIONS',
    type: 'framework',
    name: 'RACI Matrix',
    content: 'RACI Matrix: Responsible → Accountable → Consulted → Informed.',
    stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Ops']
  },
  
  // Leadership
  {
    domain: 'LEADERSHIP & HR',
    type: 'principle',
    name: 'Leadership is creating clarity',
    content: 'Leadership is not telling people what to do; it is creating clarity.',
    stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Leadership', 'HR']
  },
  {
    domain: 'LEADERSHIP & HR',
    type: 'mental_model',
    name: 'Radical Candor',
    content: 'Radical Candor: Care personally; challenge directly.',
    stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Leadership', 'HR']
  },
  
  // Finance
  {
    domain: 'FINANCE',
    type: 'principle',
    name: 'Cash flow is oxygen',
    content: 'Cash flow is the oxygen of a startup. Revenue is vanity. Profit is sanity. Cash is reality.',
    stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Finance']
  },
  {
    domain: 'FINANCE',
    type: 'mental_model',
    name: 'LTV/CAC Ratio',
    content: 'LTV/CAC Ratio: The startup finance religion. LTV > CAC by at least 3×.',
    stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
    domain_tags: ['Finance']
  },
];

async function main() {
  console.log('🚀 Quick Domain Packs Ingestion\n');
  console.log(`📊 Ingesting ${domainItems.length} high-priority items...\n`);
  
  let inserted = 0;
  
  for (let i = 0; i < domainItems.length; i++) {
    const item = domainItems[i];
    
    try {
      console.log(`[${i + 1}/${domainItems.length}] ${item.name}...`);
      
      // Generate embedding
      const embedding = await generateEmbedding(item.content);
      
      // Insert
      const { error } = await supabase
        .from('mentor_knowledge_base')
        .insert({
          book_title: `Domain Pack: ${item.domain}`,
          book_author: 'EERA Knowledge Base',
          book_category: item.domain,
          chunk_type: item.type,
          chunk_name: item.name,
          description: item.content,
          components: [item.type.replace('_', ' ').toUpperCase()],
          when_applies: `Relevant for ${item.domain_tags.join(', ')} at stages: ${item.stage_tags.join(', ')}`,
          tags: [item.domain.toLowerCase(), item.type],
          stage_tags: item.stage_tags,
          domain_tags: item.domain_tags,
          priority: item.type === 'framework' || item.type === 'principle' ? 'high' : 'medium',
          embedding,
        });
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Inserted`);
        inserted++;
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ Complete! Inserted ${inserted}/${domainItems.length} items`);
  console.log(`${'='.repeat(80)}`);
}

main().catch(console.error);

