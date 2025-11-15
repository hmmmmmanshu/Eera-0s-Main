/**
 * Domain Packs Ingestion Script
 * 
 * This script:
 * 1. Reads the Domain Packs markdown file
 * 2. Parses each domain (Marketing, Sales, GTM, etc.)
 * 3. Extracts principles, frameworks, mental models, etc.
 * 4. Generates embeddings
 * 5. Inserts into Supabase mentor_knowledge_base table
 * 
 * Usage: npx tsx scripts/ingest-domain-packs.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENROUTER_API_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_OPENROUTER_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ 
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Types
interface DomainItem {
  domain: string;
  section: string; // "Core Principles", "Biggest Mistakes", "Mental Models", etc.
  type: string; // "principle", "mistake", "mental_model", "framework", "decision_tree"
  name: string;
  content: string;
  number?: number;
}

// Helper functions
function mapDomainToTags(domain: string): { stage_tags: string[], domain_tags: string[] } {
  const domainMap: Record<string, { stage_tags: string[], domain_tags: string[] }> = {
    'MARKETING': {
      stage_tags: ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
      domain_tags: ['Marketing', 'GTM']
    },
    'GTM': {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['GTM', 'Strategy']
    },
    'SALES': {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Sales', 'GTM']
    },
    'TECH': {
      stage_tags: ['idea', 'validation', 'mvp', 'first_customers', 'early_revenue'],
      domain_tags: ['Product', 'Tech']
    },
    'PRODUCT': {
      stage_tags: ['idea', 'validation', 'mvp', 'first_customers', 'early_revenue', 'pmf'],
      domain_tags: ['Product', 'Tech']
    },
    'OPERATIONS': {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Ops']
    },
    'OPS': {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Ops']
    },
    'LEADERSHIP': {
      stage_tags: ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Leadership', 'HR']
    },
    'HR': {
      stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['HR', 'Leadership']
    },
    'FINANCE': {
      stage_tags: ['early_revenue', 'pmf', 'seed', 'growth'],
      domain_tags: ['Finance']
    }
  };
  
  // Find matching domain
  for (const [key, tags] of Object.entries(domainMap)) {
    if (domain.toUpperCase().includes(key)) {
      return tags;
    }
  }
  
  return {
    stage_tags: ['idea', 'validation', 'mvp'],
    domain_tags: ['Strategy']
  };
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}

function parseDomainPacks(content: string): DomainItem[] {
  const items: DomainItem[] = [];
  
  // Split by domains
  const domainSections = content.split(/# \*\*⭐ DOMAIN \d+ —/);
  
  for (let i = 1; i < domainSections.length; i++) {
    const section = domainSections[i];
    
    // Extract domain name
    const domainMatch = section.match(/^([^*\n]+)/);
    if (!domainMatch) continue;
    
    const domainName = domainMatch[1].trim().replace(/\*\*/g, '');
    console.log(`\n📦 Parsing domain: ${domainName}`);
    
    // Parse different sections
    parsePrinciples(section, domainName, items);
    parseMistakes(section, domainName, items);
    parseMentalModels(section, domainName, items);
    parseFrameworks(section, domainName, items);
    parseDecisionTrees(section, domainName, items);
  }
  
  return items;
}

function parsePrinciples(section: string, domain: string, items: DomainItem[]) {
  // Match both formats: "50 CORE" and "I. 50 CORE"
  const principlesMatch = section.match(/# \*\*✅\s+(?:I\.\s+)?\d+ CORE .+ PRINCIPLES[^#]+([\s\S]*?)(?=# \*\*|$)/i);
  if (!principlesMatch) return;
  
  const principlesText = principlesMatch[1];
  const lines = principlesText.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      const content = match[1].trim();
      // Remove markdown formatting
      const cleanContent = content.replace(/\\/g, '').replace(/\*\*/g, '');
      if (cleanContent && cleanContent.length > 10 && !cleanContent.startsWith('#')) {
        items.push({
          domain,
          section: 'Core Principles',
          type: 'principle',
          name: cleanContent.substring(0, 100),
          content: cleanContent
        });
      }
    }
  }
}

function parseMistakes(section: string, domain: string, items: DomainItem[]) {
  const mistakesMatch = section.match(/# \*\*❌\s+(?:II\.\s+)?\d+ BIGGEST MISTAKES[^#]+([\s\S]*?)(?=# \*\*|$)/i);
  if (!mistakesMatch) return;
  
  const mistakesText = mistakesMatch[1];
  const lines = mistakesText.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      const content = match[1].trim();
      const cleanContent = content.replace(/\\/g, '').replace(/\*\*/g, '');
      if (cleanContent && cleanContent.length > 10 && !cleanContent.startsWith('#')) {
        items.push({
          domain,
          section: 'Biggest Mistakes',
          type: 'mistake',
          name: cleanContent.substring(0, 100),
          content: cleanContent
        });
      }
    }
  }
}

function parseMentalModels(section: string, domain: string, items: DomainItem[]) {
  const modelsMatch = section.match(/# \*\*🧠 \d+ MENTAL MODELS[^#]+([\s\S]*?)(?=# \*\*|$)/i);
  if (!modelsMatch) return;
  
  const modelsText = modelsMatch[1];
  
  // Parse numbered items with descriptions
  const modelMatches = modelsText.matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s*[:\-—]\s*(.+?)(?=\n\d+\.|\n\n|$)/gms);
  
  for (const match of modelMatches) {
    const name = match[1].trim();
    const description = match[2].trim();
    
    if (name && description) {
      items.push({
        domain,
        section: 'Mental Models',
        type: 'mental_model',
        name: name,
        content: `${name}: ${description}`
      });
    }
  }
}

function parseFrameworks(section: string, domain: string, items: DomainItem[]) {
  const frameworksMatch = section.match(/# \*\*🔧 \d+ FRAMEWORKS[^#]+([\s\S]*?)(?=# \*\*|$)/i);
  if (!frameworksMatch) return;
  
  const frameworksText = frameworksMatch[1];
  
  // Parse numbered frameworks with descriptions
  const fwMatches = frameworksText.matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s*[:\-—]\s*(.+?)(?=\n\d+\.|\n\n|$)/gms);
  
  for (const match of fwMatches) {
    const name = match[1].trim();
    const description = match[2].trim();
    
    if (name && description) {
      items.push({
        domain,
        section: 'Frameworks',
        type: 'framework',
        name: name,
        content: `${name}: ${description}`
      });
    }
  }
}

function parseDecisionTrees(section: string, domain: string, items: DomainItem[]) {
  const treesMatch = section.match(/# \*\*🌳 \d+ DECISION TREES[^#]+([\s\S]*?)(?=# \*\*|$)/i);
  if (!treesMatch) return;
  
  const treesText = treesMatch[1];
  
  // Parse decision trees
  const treeMatches = treesText.matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s*[:\-—]?\s*([\s\S]*?)(?=\n\d+\.|\n\n# |$)/gm);
  
  for (const match of treeMatches) {
    const name = match[1].trim();
    const content = match[2].trim();
    
    if (name && content && content.length > 20) {
      items.push({
        domain,
        section: 'Decision Trees',
        type: 'decision_tree',
        name: name,
        content: `${name}: ${content}`
      });
    }
  }
}

async function ingestDomainItems(items: DomainItem[]): Promise<number> {
  console.log(`\n📊 Starting ingestion of ${items.length} items...\n`);
  
  let insertedCount = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    try {
      // Generate embedding
      console.log(`[${i + 1}/${items.length}] Embedding: "${item.name.substring(0, 60)}..."`);
      const embedding = await generateEmbedding(item.content);
      
      // Get tags
      const { stage_tags, domain_tags } = mapDomainToTags(item.domain);
      
      // Determine priority
      const priority = item.type === 'framework' || item.type === 'principle' || item.type === 'decision_tree'
        ? 'high'
        : 'medium';
      
      // Insert into Supabase
      const { error } = await supabase
        .from('mentor_knowledge_base')
        .insert({
          book_title: `Domain Pack: ${item.domain}`,
          book_author: 'EERA Knowledge Base',
          book_category: item.domain,
          chunk_type: item.type,
          chunk_name: item.name,
          description: item.content,
          components: [item.section],
          when_applies: `Relevant for ${domain_tags.join(', ')} at stages: ${stage_tags.join(', ')}`,
          limitations: null,
          tags: [item.domain.toLowerCase(), item.type, item.section.toLowerCase()],
          stage_tags,
          domain_tags,
          priority,
          embedding,
        });
      
      if (error) {
        console.error(`❌ Error inserting "${item.name}":`, error.message);
      } else {
        console.log(`✅ Inserted: "${item.name.substring(0, 60)}"`);
        insertedCount++;
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 20));
      
    } catch (error) {
      console.error(`❌ Error processing "${item.name}":`, error.message);
    }
  }
  
  return insertedCount;
}

async function main() {
  console.log('🚀 Starting Domain Packs Ingestion\n');
  
  // Read the markdown file
  const filePath = path.join(process.cwd(), 'data', 'mentor-knowledge', 'Domain Packs.md');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`📖 Reading file: ${filePath}\n`);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse domain packs
  console.log('🔍 Parsing domain packs...');
  const items = parseDomainPacks(content);
  console.log(`\n✅ Parsed ${items.length} items from domain packs`);
  
  // Show breakdown
  const breakdown = items.reduce((acc, item) => {
    acc[item.domain] = (acc[item.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 Breakdown by domain:');
  Object.entries(breakdown).forEach(([domain, count]) => {
    console.log(`   - ${domain}: ${count} items`);
  });
  
  // Ingest
  console.log('\n' + '='.repeat(80));
  const startTime = Date.now();
  const inserted = await ingestDomainItems(items);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ Domain Packs Ingestion Complete!');
  console.log('='.repeat(80));
  console.log(`📊 Summary:`);
  console.log(`   - Items processed: ${items.length}`);
  console.log(`   - Items inserted: ${inserted}`);
  console.log(`   - Duration: ${duration}s`);
  console.log(`   - Average: ${(inserted / parseFloat(duration)).toFixed(2)} items/second`);
  console.log('='.repeat(80));
}

main().catch(console.error);

