/**
 * Full Domain Packs Ingestion
 * Reads Domain Packs.md and ingests ALL items systematically
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
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

interface DomainItem {
  domain: string;
  type: string;
  name: string;
  content: string;
  stage_tags: string[];
  domain_tags: string[];
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}

function extractPrinciples(text: string, domain: string): DomainItem[] {
  const items: DomainItem[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      let content = match[1].trim();
      content = content.replace(/\\/g, '').replace(/\*\*/g, '');
      
      if (content.length > 10 && !content.startsWith('#') && !content.startsWith('(')) {
        items.push({
          domain,
          type: 'principle',
          name: content.substring(0, 100),
          content,
          ...getTagsForDomain(domain)
        });
      }
    }
  }
  
  return items;
}

function extractMistakes(text: string, domain: string): DomainItem[] {
  const items: DomainItem[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      let content = match[1].trim();
      content = content.replace(/\\/g, '').replace(/\*\*/g, '');
      
      if (content.length > 10 && !content.startsWith('#')) {
        items.push({
          domain,
          type: 'mistake',
          name: content.substring(0, 100),
          content,
          ...getTagsForDomain(domain)
        });
      }
    }
  }
  
  return items;
}

function getTagsForDomain(domain: string): { stage_tags: string[], domain_tags: string[] } {
  const domainUpper = domain.toUpperCase();
  
  if (domainUpper.includes('MARKETING')) {
    return {
      stage_tags: ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
      domain_tags: ['Marketing', 'GTM']
    };
  } else if (domainUpper.includes('GTM') || domainUpper.includes('GO-TO-MARKET')) {
    return {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['GTM', 'Strategy']
    };
  } else if (domainUpper.includes('SALES')) {
    return {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Sales', 'GTM']
    };
  } else if (domainUpper.includes('TECH') || domainUpper.includes('PRODUCT')) {
    return {
      stage_tags: ['idea', 'validation', 'mvp', 'first_customers', 'early_revenue', 'pmf'],
      domain_tags: ['Product', 'Tech']
    };
  } else if (domainUpper.includes('OPERATIONS') || domainUpper.includes('OPS')) {
    return {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Ops']
    };
  } else if (domainUpper.includes('LEADERSHIP') || domainUpper.includes('HR')) {
    return {
      stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Leadership', 'HR']
    };
  } else if (domainUpper.includes('FINANCE')) {
    return {
      stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Finance']
    };
  }
  
  return {
    stage_tags: ['idea', 'validation', 'mvp'],
    domain_tags: ['Strategy']
  };
}

async function ingestItems(items: DomainItem[]) {
  console.log(`\n📊 Ingesting ${items.length} items...\n`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('mentor_knowledge_base')
        .select('id')
        .eq('chunk_name', item.name)
        .eq('book_title', `Domain Pack: ${item.domain}`)
        .single();
      
      if (existing) {
        console.log(`[${i + 1}/${items.length}] ⏭️  Skipped (exists): ${item.name.substring(0, 50)}`);
        skipped++;
        continue;
      }
      
      console.log(`[${i + 1}/${items.length}] 🔄 Embedding: ${item.name.substring(0, 50)}...`);
      
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
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return { inserted, skipped };
}

async function main() {
  console.log('🚀 Full Domain Packs Ingestion\n');
  
  const filePath = path.join(process.cwd(), 'data', 'mentor-knowledge', 'Domain Packs.md');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`📖 Reading file: ${filePath}\n`);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const allItems: DomainItem[] = [];
  
  // Define domain sections manually
  const domains = [
    { name: 'MARKETING', start: 0, end: 256 },
    { name: 'GTM', start: 257, end: 544 },
    { name: 'SALES', start: 545, end: 822 },
    { name: 'TECH & PRODUCT', start: 823, end: 1124 },
    { name: 'OPERATIONS', start: 1125, end: 1428 },
    { name: 'LEADERSHIP & HR', start: 1429, end: 1724 },
    { name: 'FINANCE', start: 1725, end: 2012 },
  ];
  
  const lines = content.split('\n');
  
  for (const domain of domains) {
    console.log(`\n📦 Processing: ${domain.name}`);
    const domainText = lines.slice(domain.start, domain.end).join('\n');
    
    // Extract principles
    const principlesMatch = domainText.match(/# \*\*✅.*?PRINCIPLES.*?\n([\s\S]*?)(?=# \*\*|$)/i);
    if (principlesMatch) {
      const principles = extractPrinciples(principlesMatch[1], domain.name);
      console.log(`   ✅ Found ${principles.length} principles`);
      allItems.push(...principles);
    }
    
    // Extract mistakes
    const mistakesMatch = domainText.match(/# \*\*❌.*?MISTAKES.*?\n([\s\S]*?)(?=# \*\*|$)/i);
    if (mistakesMatch) {
      const mistakes = extractMistakes(mistakesMatch[1], domain.name);
      console.log(`   ❌ Found ${mistakes.length} mistakes`);
      allItems.push(...mistakes);
    }
  }
  
  console.log(`\n✅ Total items parsed: ${allItems.length}`);
  
  // Ingest
  console.log('\n' + '='.repeat(80));
  const { inserted, skipped } = await ingestItems(allItems);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Domain Packs Ingestion Complete!');
  console.log('='.repeat(80));
  console.log(`📊 Summary:`);
  console.log(`   - Items parsed: ${allItems.length}`);
  console.log(`   - Items inserted: ${inserted}`);
  console.log(`   - Items skipped: ${skipped}`);
  console.log('='.repeat(80));
}

main().catch(console.error);

