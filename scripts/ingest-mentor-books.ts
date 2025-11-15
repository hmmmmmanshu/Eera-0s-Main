/**
 * Mentor Knowledge Base Ingestion Script
 * 
 * This script:
 * 1. Reads the books markdown file
 * 2. Parses the JSON data for each book
 * 3. Generates embeddings for each framework/principle
 * 4. Inserts into Supabase mentor_knowledge_base table
 * 
 * Usage: npx tsx scripts/ingest-mentor-books.ts [--count=20] [--test]
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
interface Framework {
  name: string;
  type: string;
  description: string;
  components: string[];
  when_it_applies: string;
  limitations: string;
}

interface Book {
  title: string;
  author: string;
  category: string;
  tags: string[];
  layer_2_concepts_frameworks: Framework[];
}

// Helper functions
function mapCategoryToStageTags(category: string): string[] {
  const mapping: Record<string, string[]> = {
    'Foundational Startup': ['idea', 'validation', 'mvp', 'first_customers'],
    'Growth': ['early_revenue', 'pmf', 'seed', 'growth'],
    'Product': ['mvp', 'first_customers', 'early_revenue', 'pmf'],
    'Leadership': ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    'Marketing': ['mvp', 'first_customers', 'early_revenue', 'pmf', 'growth'],
    'Sales': ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
    'Finance': ['early_revenue', 'pmf', 'seed', 'growth'],
    'Operations': ['first_customers', 'early_revenue', 'pmf', 'seed', 'growth'],
  };
  
  // Check for partial matches
  for (const [key, stages] of Object.entries(mapping)) {
    if (category.includes(key)) {
      return stages;
    }
  }
  
  return ['idea', 'validation', 'mvp'];
}

function mapCategoryToDomainTags(category: string): string[] {
  const mapping: Record<string, string[]> = {
    'Foundational Startup': ['Strategy', 'GTM'],
    'Product': ['Product', 'Tech'],
    'Marketing': ['Marketing', 'GTM'],
    'Leadership': ['Leadership', 'HR'],
    'Sales': ['Sales', 'GTM'],
    'Finance': ['Finance'],
    'Operations': ['Ops'],
    'Growth': ['Marketing', 'Sales', 'GTM'],
  };
  
  for (const [key, domains] of Object.entries(mapping)) {
    if (category.includes(key)) {
      return domains;
    }
  }
  
  return ['Strategy'];
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text.substring(0, 8000), // Limit to 8000 chars to avoid token limits
  });
  return response.data[0].embedding;
}

function parseBooks(content: string): Book[] {
  const books: Book[] = [];
  
  // Split by book boundaries - look for the pattern "{\n\"title\":"
  const bookMatches = content.split(/(?=\{[\s\n]*"title":)/g);
  
  for (const bookText of bookMatches) {
    if (!bookText.trim() || bookText.trim() === '# Book Json:') continue;
    
    try {
      // Clean up the JSON - remove markdown formatting
      let cleanJson = bookText
        .replace(/^#.*$/gm, '') // Remove markdown headers
        .trim();
      
      // Try to find the JSON object
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;
      
      const book = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (book.title && book.author && book.layer_2_concepts_frameworks) {
        books.push(book);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse book: ${error.message}`);
    }
  }
  
  return books;
}

async function ingestBook(book: Book, bookIndex: number, totalBooks: number): Promise<number> {
  console.log(`\n📚 [${bookIndex + 1}/${totalBooks}] Ingesting: "${book.title}" by ${book.author}`);
  
  if (!book.layer_2_concepts_frameworks || book.layer_2_concepts_frameworks.length === 0) {
    console.log(`  ⚠️  No frameworks found, skipping...`);
    return 0;
  }
  
  let insertedCount = 0;
  
  for (let i = 0; i < book.layer_2_concepts_frameworks.length; i++) {
    const framework = book.layer_2_concepts_frameworks[i];
    
    try {
      // Create embedding text
      const embeddingText = `
        ${framework.name}
        ${framework.description}
        ${framework.when_it_applies || ''}
        Components: ${framework.components?.join(', ') || ''}
      `.trim();
      
      // Generate embedding
      console.log(`  → [${i + 1}/${book.layer_2_concepts_frameworks.length}] Embedding: "${framework.name}"`);
      const embedding = await generateEmbedding(embeddingText);
      
      // Determine priority
      const priority = framework.type === 'framework' || framework.type === 'principle' 
        ? 'high' 
        : 'medium';
      
      // Insert into Supabase
      const { error } = await supabase
        .from('mentor_knowledge_base')
        .insert({
          book_title: book.title,
          book_author: book.author,
          book_category: book.category || 'General',
          chunk_type: framework.type,
          chunk_name: framework.name,
          description: framework.description,
          components: framework.components || [],
          when_applies: framework.when_it_applies,
          limitations: framework.limitations,
          tags: book.tags || [],
          stage_tags: mapCategoryToStageTags(book.category || ''),
          domain_tags: mapCategoryToDomainTags(book.category || ''),
          priority,
          embedding,
        });
      
      if (error) {
        console.error(`  ❌ Error inserting "${framework.name}":`, error.message);
      } else {
        console.log(`  ✅ Inserted: "${framework.name}"`);
        insertedCount++;
      }
      
      // Rate limit: OpenAI allows 3000 RPM, so wait 20ms between requests
      await new Promise(resolve => setTimeout(resolve, 20));
      
    } catch (error) {
      console.error(`  ❌ Error processing "${framework.name}":`, error.message);
    }
  }
  
  return insertedCount;
}

async function main() {
  console.log('🚀 Starting Mentor Knowledge Base Ingestion\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const countArg = args.find(arg => arg.startsWith('--count='));
  const maxBooks = countArg ? parseInt(countArg.split('=')[1]) : 20;
  const isTest = args.includes('--test');
  
  console.log(`📊 Configuration:`);
  console.log(`   - Max books: ${maxBooks}`);
  console.log(`   - Test mode: ${isTest ? 'Yes' : 'No'}\n`);
  
  // Read the markdown file
  const filePath = path.join(process.cwd(), 'data', 'mentor-knowledge', 'Book Json 2ac83106be8180dcbaace3d1f50c9faf.md');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`📖 Reading file: ${filePath}\n`);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse books
  console.log('🔍 Parsing books...');
  const allBooks = parseBooks(content);
  console.log(`✅ Found ${allBooks.length} books\n`);
  
  // Take only the first N books
  const books = allBooks.slice(0, maxBooks);
  console.log(`📚 Processing ${books.length} books:\n`);
  books.forEach((book, i) => {
    console.log(`   ${i + 1}. ${book.title} by ${book.author} (${book.layer_2_concepts_frameworks?.length || 0} frameworks)`);
  });
  
  if (isTest) {
    console.log('\n🧪 Test mode - exiting without ingestion');
    return;
  }
  
  // Ingest books
  console.log('\n' + '='.repeat(80));
  console.log('Starting ingestion...');
  console.log('='.repeat(80));
  
  let totalInserted = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < books.length; i++) {
    const inserted = await ingestBook(books[i], i, books.length);
    totalInserted += inserted;
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ Ingestion Complete!');
  console.log('='.repeat(80));
  console.log(`📊 Summary:`);
  console.log(`   - Books processed: ${books.length}`);
  console.log(`   - Frameworks inserted: ${totalInserted}`);
  console.log(`   - Duration: ${duration}s`);
  console.log(`   - Average: ${(totalInserted / parseFloat(duration)).toFixed(2)} frameworks/second`);
  console.log('='.repeat(80));
}

main().catch(console.error);

