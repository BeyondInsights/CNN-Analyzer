const fs = require('fs');
const path = require('path');
const { glob } = require('glob'); // Updated import

// Add DEBUG_MODE wrapper to all console.logs
function wrapConsoleLogs(content) {
  // Skip if already has DEBUG_MODE
  if (content.includes('DEBUG_MODE')) {
    return content;
  }
  
  // Add DEBUG_MODE constant at the top of calculations.ts
  if (content.includes('// src/lib/calculations.ts')) {
    content = content.replace(
      '// src/lib/calculations.ts',
      '// src/lib/calculations.ts\n\nconst DEBUG_MODE = false; // Set to true for development'
    );
  }
  
  // Wrap standalone console.logs (but not those already in if statements)
  content = content.replace(
    /^(\s*)console\.(log|warn|error)\(/gm,
    '$1if (DEBUG_MODE) console.$2('
  );
  
  return content;
}

// Remove specific debug patterns
function removeDebugPatterns(content) {
  // Remove our price sensitivity test
  content = content.replace(
    /\/\/ ONE DEBUG LINE TO RULE THEM ALL[\s\S]*?}\s*\n/g,
    ''
  );
  
  // Remove [DEBUG], [DIAGNOSTIC], etc. from strings
  content = content.replace(/\[(DEBUG|DIAGNOSTIC|STANDALONE FIX|INCREMENTAL|INFO|VERTICAL|UTILITY|SUBSCRIPTION)\]\s*/g, '');
  
  return content;
}

// Process all TypeScript files
async function cleanupDebug() {
  try {
    const files = await glob('src/**/*.{ts,tsx}');
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      
      // Only process files with console.log
      if (content.includes('console.')) {
        newContent = wrapConsoleLogs(newContent);
        newContent = removeDebugPatterns(newContent);
        
        if (newContent !== content) {
          fs.writeFileSync(file, newContent);
          console.log(`✓ Cleaned: ${file}`);
        }
      }
    });
    
    console.log('\n✅ Debug cleanup complete!');
  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the cleanup
cleanupDebug();