import type { BotType } from "@/hooks/useBotChat";

export interface SuggestedPrompt {
  label: string;
  prompt: string;
  icon?: string;
  context?: 'general' | 'follow-up' | 'related';
}

// General prompts for each bot type (when conversation is empty)
const GENERAL_PROMPTS: Record<BotType, SuggestedPrompt[]> = {
  friend: [
    {
      label: "How are you feeling today?",
      prompt: "How are you feeling today?",
      context: 'general',
    },
    {
      label: "What's been on your mind?",
      prompt: "What's been on your mind lately?",
      context: 'general',
    },
    {
      label: "Help me process something",
      prompt: "I need help processing something that happened recently.",
      context: 'general',
    },
    {
      label: "I need support",
      prompt: "I'm going through a tough time and could use some support.",
      context: 'general',
    },
  ],
  mentor: [
    {
      label: "Strategic decision help",
      prompt: "I'm facing a strategic decision and need your perspective.",
      context: 'general',
    },
    {
      label: "Career guidance",
      prompt: "I need guidance on my career path and next steps.",
      context: 'general',
    },
    {
      label: "Leadership challenge",
      prompt: "I'm dealing with a leadership challenge. How should I approach it?",
      context: 'general',
    },
    {
      label: "Long-term planning",
      prompt: "Help me think through my long-term goals and how to achieve them.",
      context: 'general',
    },
  ],
  ea: [
    {
      label: "Help me prioritize",
      prompt: "I have a lot on my plate. Help me prioritize my tasks.",
      context: 'general',
    },
    {
      label: "Create a plan",
      prompt: "I need to create a plan for [project/task]. Can you help?",
      context: 'general',
    },
    {
      label: "Time management",
      prompt: "I'm struggling with time management. What strategies can you suggest?",
      context: 'general',
    },
    {
      label: "Break down a task",
      prompt: "Help me break down this complex task into manageable steps.",
      context: 'general',
    },
  ],
};

// Follow-up prompts (when conversation has messages)
const FOLLOW_UP_PROMPTS: SuggestedPrompt[] = [
  {
    label: "Tell me more",
    prompt: "Can you tell me more about that?",
    context: 'follow-up',
  },
  {
    label: "Give me examples",
    prompt: "Can you give me some examples?",
    context: 'follow-up',
  },
  {
    label: "What's next?",
    prompt: "What should I do next?",
    context: 'follow-up',
  },
  {
    label: "Help me implement",
    prompt: "How can I implement this?",
    context: 'follow-up',
  },
];

/**
 * Get suggested prompts based on bot type and conversation context
 */
export function getSuggestedPrompts(
  botType: BotType,
  hasMessages: boolean,
  lastMessage?: string
): SuggestedPrompt[] {
  // If no messages, return general prompts for this bot
  if (!hasMessages) {
    return GENERAL_PROMPTS[botType];
  }

  // If has messages, mix general and follow-up prompts
  // Rotate suggestions to avoid showing same ones always
  const general = GENERAL_PROMPTS[botType];
  const followUp = FOLLOW_UP_PROMPTS;
  
  // Take 2 general and 2 follow-up prompts
  const selectedGeneral = general.slice(0, 2);
  const selectedFollowUp = followUp.slice(0, 2);
  
  // Shuffle and return
  const combined = [...selectedGeneral, ...selectedFollowUp];
  return shuffleArray(combined).slice(0, 4);
}

/**
 * Shuffle array to randomize prompt order
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

