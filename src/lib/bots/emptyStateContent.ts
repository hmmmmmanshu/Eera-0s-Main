import { MessageSquare, Target, Zap, LucideIcon } from "lucide-react";

export interface QuickAction {
  label: string;
  prompt: string;
  icon?: LucideIcon;
}

export interface EmptyStateContent {
  welcome: string;
  subtitle?: string;
  quickActions: QuickAction[];
  tips?: string[];
}

export const EMPTY_STATE_CONTENT: Record<'friend' | 'mentor' | 'ea', EmptyStateContent> = {
  friend: {
    welcome: "Hi! I'm here to support you.",
    subtitle: "How are you feeling today?",
    quickActions: [
      {
        label: "I'm feeling stressed about...",
        prompt: "I'm feeling stressed about ",
        icon: MessageSquare,
      },
      {
        label: "Help me reflect on...",
        prompt: "Help me reflect on ",
        icon: MessageSquare,
      },
      {
        label: "I need encouragement about...",
        prompt: "I need encouragement about ",
        icon: MessageSquare,
      },
      {
        label: "Tell me about your day",
        prompt: "Tell me about your day",
        icon: MessageSquare,
      },
    ],
    tips: [
      "I remember our conversations and learn about you over time",
      "Feel free to share anything that's on your mind",
      "I'm here to listen and provide support whenever you need it",
    ],
  },
  mentor: {
    welcome: "Let's discuss your strategic challenges.",
    subtitle: "What would you like to work on?",
    quickActions: [
      {
        label: "Help me think through fundraising strategy",
        prompt: "Help me think through fundraising strategy",
        icon: Target,
      },
      {
        label: "Analyze my go-to-market approach",
        prompt: "Analyze my go-to-market approach",
        icon: Target,
      },
      {
        label: "Review my competitive positioning",
        prompt: "Review my competitive positioning",
        icon: Target,
      },
      {
        label: "Strategic planning for next quarter",
        prompt: "Help me with strategic planning for next quarter",
        icon: Target,
      },
    ],
    tips: [
      "I can help with strategic frameworks and expert insights",
      "Bring me your toughest challenges and we'll work through them together",
      "I provide structured, actionable advice based on proven methodologies",
    ],
  },
  ea: {
    welcome: "What can I help you accomplish today?",
    subtitle: "Let's get things done efficiently.",
    quickActions: [
      {
        label: "Schedule a team meeting",
        prompt: "Schedule a team meeting",
        icon: Zap,
      },
      {
        label: "Create a task list for...",
        prompt: "Create a task list for ",
        icon: Zap,
      },
      {
        label: "Summarize my priorities",
        prompt: "Summarize my priorities",
        icon: Zap,
      },
      {
        label: "Help me organize my day",
        prompt: "Help me organize my day",
        icon: Zap,
      },
    ],
    tips: [
      "I can help manage tasks, schedule, and coordinate across hubs",
      "Tell me what you need done and I'll help you execute efficiently",
      "I keep track of your priorities and help you stay organized",
    ],
  },
};

