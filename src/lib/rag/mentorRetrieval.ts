/**
 * Mentor RAG Retrieval System
 * 
 * Retrieves relevant frameworks from the knowledge base and applies
 * contradiction resolution before passing to the LLM.
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { resolveContradictions, formatResolvedFrameworks } from './contradictionResolver';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: true,
});

export interface RetrievedFramework {
  id: string;
  book_title: string;
  book_author: string;
  chunk_name: string;
  chunk_type: string;
  description: string;
  components: string[];
  when_applies: string;
  limitations: string;
  similarity_score: number;
  priority?: string;
}

/**
 * Retrieve relevant frameworks with contradiction resolution
 */
export async function retrieveRelevantFrameworks(
  question: string,
  founderStage?: string,
  founderIndustry?: string,
  limit: number = 5
): Promise<RetrievedFramework[]> {
  try {
    console.log('[Mentor RAG] Retrieving frameworks for:', question);
    
    // Step 1: Generate embedding for the question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question,
    });
    const questionEmbedding = embeddingResponse.data[0].embedding;
    
    // Step 2: Query Supabase with vector similarity
    const { data, error } = await supabase.rpc('match_mentor_knowledge', {
      query_embedding: questionEmbedding,
      match_threshold: 0.7,
      match_count: limit * 2, // Get more for filtering
      filter_stage: founderStage || null,
    });
    
    if (error) {
      console.error('[Mentor RAG] Retrieval error:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[Mentor RAG] No frameworks found');
      return [];
    }
    
    // Step 3: Sort by priority and similarity
    let results = data as RetrievedFramework[];
    
    results = results.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.similarity_score - a.similarity_score;
    });
    
    // Return top N
    const topResults = results.slice(0, limit);
    
    console.log('[Mentor RAG] Retrieved', topResults.length, 'frameworks');
    console.log('[Mentor RAG] Frameworks:', topResults.map(f => f.chunk_name));
    
    return topResults;
    
  } catch (error) {
    console.error('[Mentor RAG] Error in retrieveRelevantFrameworks:', error);
    return [];
  }
}

/**
 * Format frameworks for LLM prompt with contradiction resolution
 */
export function formatFrameworksForPrompt(
  frameworks: RetrievedFramework[],
  founderStage?: string
): string {
  if (frameworks.length === 0) return '';
  
  // Apply contradiction resolution
  const resolved = resolveContradictions(frameworks, founderStage);
  
  // Format with resolution guidance
  return formatResolvedFrameworks(resolved);
}

