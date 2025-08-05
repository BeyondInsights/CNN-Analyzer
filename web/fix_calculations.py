#!/usr/bin/env python3
import re

print("🔧 Fixing calculations.ts syntax errors...")

with open('src/lib/calculations.ts', 'r') as f:
    lines = f.readlines()

# Fix the problematic section (lines 298-305)
# The continue statements are outside the for loop
fixed_lines = []
for i, line in enumerate(lines):
    line_num = i + 1
    
    # Fix line 300 - remove the misplaced continue
    if line_num == 300 and 'if (\'feature\' === undefined' in line:
        # Skip this line - it's nonsensical
        continue
    
    # Fix line 302 - remove the misplaced continue  
    if line_num == 302 and 'if (!feature) continue;' in line:
        # Skip this line - feature doesn't exist yet
        continue
    
    fixed_lines.append(line)

# Write the fixed content
with open('src/lib/calculations.ts', 'w') as f:
    f.writelines(fixed_lines)

print("✓ Removed misplaced continue statements")

# Now let's properly structure the feature utilities section
with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Fix the streaming features section
streaming_fix = '''  // Feature utilities - Streaming
  if (product.streamingFeatures && product.streamingFeatures.length > 0) {
    const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};
    for (const feature of product.streamingFeatures) {
      if (!feature || typeof feature !== 'string') continue;
      const featureKey = feature.replace(/\s+/g, '_').replace(/-/g, '');
      if (streamingFeatures[featureKey]) {
        featureUtility += streamingFeatures[featureKey];
      }
    }
  }'''

# Replace the broken section
content = re.sub(
    r'// Feature utilities - Streaming.*?for \(const feature of product\.streamingFeatures\).*?\n.*?\n.*?\n.*?\n.*?\n.*?\}',
    streaming_fix,
    content,
    flags=re.DOTALL
)

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Fixed streaming features section")
