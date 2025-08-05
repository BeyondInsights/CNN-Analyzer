#!/usr/bin/env python3

print("🔧 Final fix for feature utilities...")

with open('src/lib/calculations.ts', 'r') as f:
    lines = f.readlines()

# Build the fixed version line by line
fixed_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # When we hit the reader features section, replace it completely
    if '// Feature utilities - Reader' in line:
        # Add the complete working reader section
        fixed_lines.append('  // Feature utilities - Reader\n')
        fixed_lines.append('  if (product.readerFeatures && product.readerFeatures.length > 0) {\n')
        fixed_lines.append('    const readerFeatures = p.all_features?.reader || p.features?.reader || {};\n')
        fixed_lines.append('    for (const feature of product.readerFeatures) {\n')
        fixed_lines.append('      if (!feature || typeof feature !== "string") continue;\n')
        fixed_lines.append('      const featureKey = feature.replace(/\\s+/g, "_").replace(/-/g, "");\n')
        fixed_lines.append('      if (readerFeatures[featureKey]) {\n')
        fixed_lines.append('        featureUtility += readerFeatures[featureKey];\n')
        fixed_lines.append('      }\n')
        fixed_lines.append('    }\n')
        fixed_lines.append('  }\n')
        
        # Skip old implementation
        i += 1
        while i < len(lines) and '// Feature utilities - Streaming' not in lines[i]:
            i += 1
        continue
    
    # When we hit the streaming features section, replace it completely
    elif '// Feature utilities - Streaming' in line:
        # Add the complete working streaming section
        fixed_lines.append('  \n')
        fixed_lines.append('  // Feature utilities - Streaming\n')
        fixed_lines.append('  if (product.streamingFeatures && product.streamingFeatures.length > 0) {\n')
        fixed_lines.append('    const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};\n')
        fixed_lines.append('    for (const feature of product.streamingFeatures) {\n')
        fixed_lines.append('      if (!feature || typeof feature !== "string") continue;\n')
        fixed_lines.append('      const featureKey = feature.replace(/\\s+/g, "_").replace(/-/g, "");\n')
        fixed_lines.append('      if (streamingFeatures[featureKey]) {\n')
        fixed_lines.append('        featureUtility += streamingFeatures[featureKey];\n')
        fixed_lines.append('      }\n')
        fixed_lines.append('    }\n')
        fixed_lines.append('  }\n')
        
        # Skip old implementation
        i += 1
        while i < len(lines) and '// Vertical utilities' not in lines[i]:
            i += 1
        continue
    else:
        fixed_lines.append(line)
        i += 1

with open('src/lib/calculations.ts', 'w') as f:
    f.writelines(fixed_lines)

print("✓ Completely replaced feature utilities sections")
