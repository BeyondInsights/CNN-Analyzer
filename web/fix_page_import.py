#!/usr/bin/env python3
import re

print("🔧 Fixing page.tsx imports...")

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the imports section
import_section_match = re.search(r'(^import.*?)\n\n', content, re.MULTILINE | re.DOTALL)

if import_section_match:
    imports = import_section_match.group(1)
    
    # Check if runSecureSimulation is already imported
    if 'runSecureSimulation' not in imports:
        # Add the import after the last import statement
        new_import = "import { runSecureSimulation } from '@/lib/httpSimulation';"
        
        # Find a good place to add it (after other @/lib imports if they exist)
        if '@/lib' in imports:
            # Add after the last @/lib import
            imports = re.sub(
                r"(import.*?from\s+['\"]@/lib/[^'\"]+['\"];?)",
                lambda m: m.group(1) + '\n' + new_import,
                imports,
                count=1,
                flags=re.MULTILINE
            )
        else:
            # Just add at the end of imports
            imports = imports + '\n' + new_import
        
        # Replace the imports section
        content = content[:import_section_match.start(1)] + imports + content[import_section_match.end(1):]
        
        print("✓ Added runSecureSimulation import")
    else:
        print("✓ Import already exists")
    
    # Make sure it's being used correctly in handleSimulation
    # Replace any runSimulation with runSecureSimulation
    content = re.sub(
        r'const result = await runSimulation\(',
        'const result = await runSecureSimulation(',
        content
    )
    
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    
    print("✓ Fixed function calls")
else:
    print("⚠️ Could not find imports section")
    
    # Just add it at the top after 'use client'
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if "'use client'" in line or '"use client"' in line:
            lines.insert(i + 1, "import { runSecureSimulation } from '@/lib/httpSimulation';")
            break
    
    content = '\n'.join(lines)
    
    # Fix function calls
    content = re.sub(
        r'const result = await runSimulation\(',
        'const result = await runSecureSimulation(',
        content
    )
    
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    
    print("✓ Added import and fixed calls")
