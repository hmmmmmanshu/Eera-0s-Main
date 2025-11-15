const fs = require('fs');
const path = require('path');

const files = [
  'src/components/cognitive/MoodTracker.tsx',
  'src/components/cognitive/WeeklyOverview.tsx',
  'src/components/cognitive/CalendarPanel.tsx',
  'src/components/cognitive/IdeasPanel.tsx',
  'src/components/cognitive/ReflectionStream.tsx',
  'src/components/cognitive/CognitiveDiagnostics.tsx',
  'src/components/cognitive/CognitiveChat.tsx',
  'src/components/cognitive/CognitiveTopBar.tsx',
  'src/components/cognitive/CognitiveChatPanel.tsx',
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace lucide-react import with DynamicIcon
  content = content.replace(
    /import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"];?/g,
    'import { DynamicIcon } from "@/components/ui/DynamicIcon";'
  );
  
  // Replace icon usages like <IconName className="..." />
  // This is a simple regex - might need manual fixes for complex cases
  const iconPattern = /<([A-Z][a-zA-Z0-9]+)\s+(className="[^"]*"[^>]*)\s*\/>/g;
  content = content.replace(iconPattern, '<DynamicIcon name="$1" $2 />');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✨ All files processed!');

