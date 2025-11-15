import { preloadIcons } from "@/components/ui/DynamicIcon";

/**
 * Common icons used across the Cognitive Hub
 * Preload these on app initialization to prevent flash
 */
const COGNITIVE_HUB_ICONS = [
  // Navigation
  "ChevronLeft",
  "ChevronRight",
  "List",
  
  // Chat actions
  "Send",
  "Trash",
  "Edit",
  "Copy",
  "RotateCcw",
  "Check",
  "X",
  
  // Message states
  "Loader2",
  "AlertCircle",
  
  // Sidebar
  "Plus",
  "Pin",
  "Archive",
  "MoreVertical",
  "Search",
  
  // Empty state
  "MessageSquare",
  "Sparkles",
  "Target",
  "Calendar",
  "Lightbulb",
  "TrendingUp",
  "Users",
  "FileText",
  "BarChart",
  "Heart",
  "Brain",
  "Zap",
];

/**
 * Icons used across all hubs
 */
const COMMON_ICONS = [
  "Home",
  "Settings",
  "User",
  "LogOut",
  "Menu",
  "Bell",
  "HelpCircle",
];

/**
 * Preload all common icons
 * Call this in App.tsx or main entry point
 */
export async function preloadCommonIcons(): Promise<void> {
  const allIcons = [...new Set([...COGNITIVE_HUB_ICONS, ...COMMON_ICONS])];
  
  try {
    await preloadIcons(allIcons);
    console.log(`✅ Preloaded ${allIcons.length} icons`);
  } catch (error) {
    console.warn("⚠️ Some icons failed to preload:", error);
  }
}

/**
 * Preload icons for a specific hub
 */
export async function preloadHubIcons(hub: string): Promise<void> {
  const hubIconMap: Record<string, string[]> = {
    cognitive: COGNITIVE_HUB_ICONS,
    marketing: ["TrendingUp", "Share2", "Image", "Calendar", "BarChart"],
    sales: ["DollarSign", "Users", "Phone", "Mail", "FileText"],
    finance: ["DollarSign", "TrendingUp", "PieChart", "Receipt", "Wallet"],
    ops: ["Settings", "Workflow", "CheckSquare", "List", "GitBranch"],
    hr: ["Users", "UserPlus", "Award", "FileText", "Calendar"],
    legal: ["Scale", "FileText", "Shield", "AlertTriangle", "CheckCircle"],
  };

  const icons = hubIconMap[hub] || [];
  await preloadIcons(icons);
}

