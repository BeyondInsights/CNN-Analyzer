#!/usr/bin/env python3
import re

# Fix page.tsx imports
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace runServerSimulation with runSimulation
content = re.sub(r'runServerSimulation', 'runSimulation', content)

# Make sure the import is correct
content = re.sub(
    r"import\s*{\s*runServerSimulation\s*}\s*from\s*['\"]\.\/actions['\"]",
    "import { runSimulation } from './actions'",
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
print("✓ Fixed page.tsx imports")

# Check what's actually exported from actions.ts
print("\nChecking exports in actions.ts...")
with open('src/app/actions.ts', 'r') as f:
    actions_content = f.read()
    
# Find all export statements
exports = re.findall(r'export\s+(?:async\s+)?function\s+(\w+)', actions_content)
print(f"Found exports: {', '.join(exports)}")

# If runSimulation isn't exported, add it
if 'runSimulation' not in exports:
    print("Adding runSimulation export...")
    # Find runServerSimulation and rename it or add alias
    if 'runServerSimulation' in exports:
        actions_content = re.sub(
            r'export\s+async\s+function\s+runServerSimulation',
            'export async function runSimulation',
            actions_content
        )
    with open('src/app/actions.ts', 'w') as f:
        f.write(actions_content)
    print("✓ Added runSimulation export")
