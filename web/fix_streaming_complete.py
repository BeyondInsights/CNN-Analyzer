#!/usr/bin/env python3

print("🔧 Replacing streaming features section...")

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Replace the broken streaming section
old_streaming = '''  // Feature utilities - Streaming
  if (product.streamingFeatures && product.streamingFeatures.length > 0) {
    const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};
    for (const feature of product.streamingFeatures) {
      if (!feature || typeof feature !== 'string') continue;
      if (streamingFeatures[featureKey]) {
        featureUtility += streamingFeatures[featureKey];
      }
    }
  }'''

new_streaming = '''  // Feature utilities - Streaming
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

content = content.replace(old_streaming, new_streaming)

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Fixed streaming features section")
