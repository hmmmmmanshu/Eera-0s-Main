import { preloadIcons } from "@/components/ui/DynamicIcon";

/**
 * Common icons used across the app
 * Preload these on app initialization to prevent flash
 */
const COMMON_APP_ICONS = [
  // Navigation
  "ChevronLeft",
  "ChevronRight",
  "Menu",
  "X",
  
  // Common actions
  "Plus",
  "Edit",
  "Trash",
  "Search",
  "Settings",
  
  // Status
  "Check",
  "AlertCircle",
  "Loader2",
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
  const allIcons = [...new Set([...COMMON_APP_ICONS, ...COMMON_ICONS])];
  
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

