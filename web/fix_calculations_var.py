#!/usr/bin/env python3
import re

print("🔧 Fixing streamingFeatures undefined error in calculations.ts...")

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Find the calculateUtility function
pattern = r'function calculateUtility\([^{]*\{(.*?)^\}'
match = re.search(pattern, content, re.MULTILINE | re.DOTALL)

if match:
    func_content = match.group(0)
    
    # Check if streamingFeatures is declared
    if 'const streamingFeatures' not in func_content and 'let streamingFeatures' not in func_content:
        print("Found issue: streamingFeatures not declared")
        
        # Look for where it's used without declaration
        # It should be declared before use, like:
        # const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};
        
        # Fix by ensuring declaration exists before use
        content = re.sub(
            r'(\s+)(if\s*\(product\.streamingFeatures.*?\{)\n',
            r'\1\2\n\1  const streamingFeatures = p.all_features?.streaming || p.features?.streaming || {};\n',
            content
        )
        
        # Also check for readerFeatures
        if 'const readerFeatures' not in func_content and 'let readerFeatures' not in func_content:
            content = re.sub(
                r'(\s+)(if\s*\(product\.readerFeatures.*?\{)\n',
                r'\1\2\n\1  const readerFeatures = p.all_features?.reader || p.features?.reader || {};\n',
                content
            )

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Fixed variable declarations")
