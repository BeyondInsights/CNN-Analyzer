#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Make sure it imports from httpSimulation
if 'runSecureSimulation' not in content:
    # Add the import if missing
    content = re.sub(
        r"(import.*from.*['\"]@/lib/types['\"];?)",
        r"\1\nimport { runSecureSimulation } from '@/lib/httpSimulation';",
        content
    )

# Make sure handleSimulation uses runSecureSimulation
content = re.sub(
    r'const result = await runSimulation\(',
    'const result = await runSecureSimulation(',
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Updated page.tsx to use httpSimulation")
