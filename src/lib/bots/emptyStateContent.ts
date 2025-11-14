// DO NOT import icons at module level - causes temporal dead zone in bundled code
// Icons are imported dynamically in the component that uses them

export interface QuickAction {
  label: string;
  prompt: string;
  iconName?: 'MessageSquare' | 'Target' | 'Zap';
}

export interface EmptyStateContent {
  welcome: string;
  subtitle?: string;
  quickActions: QuickAction[];
  tips?: string[];
}

// Export as function - create content object ONLY when called, not at module load time
// This prevents any module-level initialization issues
export function getEmptyStateContentData() {
  // Create the content object inside the function to ensure it's only evaluated when called
  return {
    friend: {
      welcome: "Hi! I'm here to support you.",
      subtitle: "How are you feeling today?",
      quickActions: [
        {
          label: "I'm feeling stressed about...",
          prompt: "I'm feeling stressed about ",
          iconName: 'MessageSquare',
        },
        {
          label: "Help me reflect on...",
          prompt: "Help me reflect on ",
          iconName: 'MessageSquare',
        },
        {
          label: "I need encouragement about...",
          prompt: "I need encouragement about ",
          iconName: 'MessageSquare',
        },
        {
          label: "Tell me about your day",
          prompt: "Tell me about your day",
          iconName: 'MessageSquare',
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
          iconName: 'Target',
        },
        {
          label: "Analyze my go-to-market approach",
          prompt: "Analyze my go-to-market approach",
          iconName: 'Target',
        },
        {
          label: "Review my competitive positioning",
          prompt: "Review my competitive positioning",
          iconName: 'Target',
        },
        {
          label: "Strategic planning for next quarter",
          prompt: "Help me with strategic planning for next quarter",
          iconName: 'Target',
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
          iconName: 'Zap',
        },
        {
          label: "Create a task list for...",
          prompt: "Create a task list for ",
          iconName: 'Zap',
        },
        {
          label: "Summarize my priorities",
          prompt: "Summarize my priorities",
          iconName: 'Zap',
        },
        {
          label: "Help me organize my day",
          prompt: "Help me organize my day",
          iconName: 'Zap',
        },
      ],
      tips: [
        "I can help manage tasks, schedule, and coordinate across hubs",
        "Tell me what you need done and I'll help you execute efficiently",
        "I keep track of your priorities and help you stay organized",
      ],
    },
  };
}

