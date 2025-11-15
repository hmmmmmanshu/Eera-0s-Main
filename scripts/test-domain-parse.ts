import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'data', 'mentor-knowledge', 'Domain Packs.md');
const content = fs.readFileSync(filePath, 'utf-8');

console.log('File length:', content.length);
console.log('\nFirst 500 chars:');
console.log(content.substring(0, 500));

// Split by domains
const domainSections = content.split(/# \*\*⭐ DOMAIN \d+ —/);
console.log('\n\nNumber of domain sections:', domainSections.length);

for (let i = 1; i < domainSections.length; i++) {
  const section = domainSections[i];
  const domainMatch = section.match(/^([^*\n]+)/);
  if (domainMatch) {
    const domainName = domainMatch[1].trim().replace(/\*\*/g, '');
    console.log(`\nDomain ${i}: ${domainName}`);
    
    // Check for principles
    const principlesMatch = section.match(/# \*\*✅\s+(?:I\.\s+)?\d+ CORE .+ PRINCIPLES/i);
    console.log(`  Has principles: ${!!principlesMatch}`);
    
    // Check for mistakes
    const mistakesMatch = section.match(/# \*\*❌\s+(?:II\.\s+)?\d+ BIGGEST MISTAKES/i);
    console.log(`  Has mistakes: ${!!mistakesMatch}`);
  }
}

