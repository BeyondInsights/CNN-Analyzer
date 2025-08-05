#!/usr/bin/env python3
import re
import os

print("🧹 Cleaning up debugging statements...")

files_to_clean = [
    'src/lib/calculations.ts',
    'src/lib/httpSimulation.ts',
    'src/app/api/simulation/route.ts',
    'src/app/page.tsx',
    'src/components/ReportDisplay.tsx'
]

for filepath in files_to_clean:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Remove console.log statements with DEBUG, API, PAGE, etc.
        cleaned = re.sub(r'^\s*console\.log\([^)]*\);?\s*$', '', content, flags=re.MULTILINE)
        
        # Remove DEBUG_MODE references
        cleaned = re.sub(r'^\s*if\s*\(DEBUG_MODE\).*?;?\s*$', '', cleaned, flags=re.MULTILINE)
        
        # Clean up empty lines
        cleaned = re.sub(r'\n\n\n+', '\n\n', cleaned)
        
        with open(filepath, 'w') as f:
            f.write(cleaned)
        
        print(f"   ✓ Cleaned {filepath}")

print("✅ Debugging statements removed")
