/**
 * Contradiction Resolution Engine
 * 
 * Applies heuristics to resolve conflicting advice from multiple frameworks:
 * 1. Principles > Opinions
 * 2. Stage > Strategy
 * 3. Context > Content
 * 4. Clarify Before Concluding
 */

import { RetrievedFramework } from './mentorRetrieval';

export interface ResolvedFrameworks {
  primary: RetrievedFramework[];
  conflicts: ConflictGroup[];
  hasConflicts: boolean;
}

export interface ConflictGroup {
  topic: string;
  frameworks: RetrievedFramework[];
  resolution: 'stage_specific' | 'context_dependent' | 'trade_off' | 'clarify_needed';
  reasoning: string;
}

/**
 * Detect if two frameworks conflict
 */
function detectConflict(fw1: RetrievedFramework, fw2: RetrievedFramework): boolean {
  // Simple heuristic: Check if they're the same type but have opposing keywords
  if (fw1.chunk_type !== fw2.chunk_type) return false;
  
  const opposingPairs = [
    ['build', 'don\'t build'],
    ['focus on product', 'focus on distribution'],
    ['hire', 'don\'t hire'],
    ['raise money', 'bootstrap'],
    ['scale', 'stay small'],
    ['automate', 'manual'],
    ['talk to users', 'don\'t over-index'],
    ['move fast', 'move slow'],
    ['add features', 'remove features'],
  ];
  
  const desc1 = fw1.description.toLowerCase();
  const desc2 = fw2.description.toLowerCase();
  
  for (const [term1, term2] of opposingPairs) {
    if ((desc1.includes(term1) && desc2.includes(term2)) ||
        (desc1.includes(term2) && desc2.includes(term1))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Resolve conflicts using the hierarchy
 */
function resolveConflict(
  frameworks: RetrievedFramework[],
  founderStage?: string
): ConflictGroup {
  // Step 1: Check if it's stage-specific
  const stageSpecific = frameworks.filter(fw => 
    founderStage && fw.when_applies.toLowerCase().includes(founderStage.toLowerCase())
  );
  
  if (stageSpecific.length > 0 && stageSpecific.length < frameworks.length) {
    return {
      topic: frameworks[0].chunk_name,
      frameworks,
      resolution: 'stage_specific',
      reasoning: `For your stage (${founderStage}), prioritize: ${stageSpecific.map(f => f.chunk_name).join(', ')}`
    };
  }
  
  // Step 2: Check if it's principle vs opinion
  const principles = frameworks.filter(fw => fw.chunk_type === 'principle');
  const others = frameworks.filter(fw => fw.chunk_type !== 'principle');
  
  if (principles.length > 0 && others.length > 0) {
    return {
      topic: frameworks[0].chunk_name,
      frameworks,
      resolution: 'stage_specific',
      reasoning: 'Principles take precedence over tactical advice'
    };
  }
  
  // Step 3: Check priority levels
  const highPriority = frameworks.filter(fw => fw.priority === 'high');
  const lowerPriority = frameworks.filter(fw => fw.priority !== 'high');
  
  if (highPriority.length > 0 && lowerPriority.length > 0) {
    return {
      topic: frameworks[0].chunk_name,
      frameworks,
      resolution: 'context_dependent',
      reasoning: 'High-priority frameworks are more foundational'
    };
  }
  
  // Step 4: If still unclear, it's a trade-off
  return {
    topic: frameworks[0].chunk_name,
    frameworks,
    resolution: 'trade_off',
    reasoning: 'Both approaches are valid depending on context. Present as trade-off.'
  };
}

/**
 * Main resolution function
 */
export function resolveContradictions(
  frameworks: RetrievedFramework[],
  founderStage?: string
): ResolvedFrameworks {
  if (frameworks.length <= 1) {
    return {
      primary: frameworks,
      conflicts: [],
      hasConflicts: false
    };
  }
  
  // Detect conflicts
  const conflictGroups: Map<string, RetrievedFramework[]> = new Map();
  const nonConflicting: RetrievedFramework[] = [];
  
  for (let i = 0; i < frameworks.length; i++) {
    let hasConflict = false;
    
    for (let j = i + 1; j < frameworks.length; j++) {
      if (detectConflict(frameworks[i], frameworks[j])) {
        hasConflict = true;
        const key = `conflict_${i}_${j}`;
        
        if (!conflictGroups.has(key)) {
          conflictGroups.set(key, [frameworks[i], frameworks[j]]);
        }
      }
    }
    
    if (!hasConflict) {
      nonConflicting.push(frameworks[i]);
    }
  }
  
  // Resolve each conflict group
  const resolvedConflicts: ConflictGroup[] = [];
  
  for (const [_, conflictingFrameworks] of conflictGroups) {
    const resolved = resolveConflict(conflictingFrameworks, founderStage);
    resolvedConflicts.push(resolved);
  }
  
  return {
    primary: nonConflicting,
    conflicts: resolvedConflicts,
    hasConflicts: resolvedConflicts.length > 0
  };
}

/**
 * Format resolved frameworks for the LLM prompt
 */
export function formatResolvedFrameworks(resolved: ResolvedFrameworks): string {
  let output = '';
  
  // Add primary (non-conflicting) frameworks
  if (resolved.primary.length > 0) {
    output += '## PRIMARY FRAMEWORKS (No Conflicts)\n\n';
    
    resolved.primary.forEach((fw, index) => {
      output += `### Framework ${index + 1}: ${fw.chunk_name}\n`;
      output += `**Source:** ${fw.book_title} by ${fw.book_author}\n`;
      output += `**Type:** ${fw.chunk_type}\n\n`;
      output += `**Description:**\n${fw.description}\n\n`;
      output += `**When to apply:**\n${fw.when_applies}\n\n`;
      output += `**Limitations:**\n${fw.limitations || 'None specified'}\n\n`;
      
      if (fw.components && fw.components.length > 0) {
        output += `**Components:**\n${fw.components.map(c => `- ${c}`).join('\n')}\n\n`;
      }
      
      output += '---\n\n';
    });
  }
  
  // Add conflicts with resolution guidance
  if (resolved.hasConflicts) {
    output += '## CONFLICTING FRAMEWORKS (Resolution Required)\n\n';
    output += '⚠️ **The following frameworks present different approaches. Apply the resolution strategy below.**\n\n';
    
    resolved.conflicts.forEach((conflict, index) => {
      output += `### Conflict ${index + 1}: ${conflict.topic}\n\n`;
      output += `**Resolution Strategy:** ${conflict.resolution}\n`;
      output += `**Reasoning:** ${conflict.reasoning}\n\n`;
      
      conflict.frameworks.forEach((fw, fwIndex) => {
        output += `#### Option ${fwIndex + 1}: ${fw.chunk_name}\n`;
        output += `**Source:** ${fw.book_title}\n`;
        output += `**Description:** ${fw.description}\n`;
        output += `**Best when:** ${fw.when_applies}\n\n`;
      });
      
      output += '**YOUR TASK:**\n';
      
      if (conflict.resolution === 'trade_off') {
        output += '- Present BOTH options to the founder\n';
        output += '- Explain the trade-offs clearly\n';
        output += '- Recommend based on their stage and context\n';
        output += '- Ask clarifying questions if needed\n\n';
      } else if (conflict.resolution === 'stage_specific') {
        output += '- Prioritize the stage-appropriate framework\n';
        output += '- Mention the alternative briefly\n';
        output += '- Explain why stage matters here\n\n';
      } else if (conflict.resolution === 'context_dependent') {
        output += '- Ask the founder for more context\n';
        output += '- Present both options with context requirements\n';
        output += '- Help them decide based on their specific situation\n\n';
      } else {
        output += '- Ask clarifying questions to determine which framework applies\n\n';
      }
      
      output += '---\n\n';
    });
  }
  
  return output;
}

