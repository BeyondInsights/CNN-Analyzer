#!/usr/bin/env python3
import re

print("🔧 Fixing calculations.ts syntax errors...")

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Find the broken streaming features section and replace it
# Look for the pattern with proper regex escaping
pattern = r'// Feature utilities - Streaming.*?if \(product\.streamingFeatures.*?\{[^}]*?\}[^}]*?\}'

# Proper replacement with raw string
replacement = '''  // Feature utilities - Streaming
  if (product.streamingFeatures && product.streamingFeatures.length > 0) {
    const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};
    for (const feature of product.streamingFeatures) {
      if (!feature || typeof feature !== 'string') continue;
      const featureKey = feature.replace(/\\s+/g, '_').replace(/-/g, '');
      if (streamingFeatures[featureKey]) {
        featureUtility += streamingFeatures[featureKey];
      }
    }
  }'''

try:
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    with open('src/lib/calculations.ts', 'w') as f:
        f.write(content)
    print("✓ Fixed streaming features section with regex")
except:
    print("Regex replacement failed, trying line-by-line fix...")
    
    # Fallback: Fix by line numbers
    with open('src/lib/calculations.ts', 'r') as f:
        lines = f.readlines()
    
    # Remove problematic lines (adjust line numbers as needed)
    filtered_lines = []
    skip_lines = [300, 302]  # Lines with misplaced continue statements
    
    for i, line in enumerate(lines, 1):
        if i in skip_lines:
            continue
        filtered_lines.append(line)
    
    with open('src/lib/calculations.ts', 'w') as f:
        f.writelines(filtered_lines)
    
    print("✓ Fixed by removing problematic lines")
