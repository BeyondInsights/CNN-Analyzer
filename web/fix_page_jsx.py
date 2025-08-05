#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Remove excessive blank lines (more than 2 consecutive)
import re
content = re.sub(r'\n\n\n+', '\n\n', content)

# Make sure the return statement is properly formatted
content = re.sub(
    r'// ============ MAIN RENDER ============\s*\n\s*return \(',
    '// ============ MAIN RENDER ============\n  return (',
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed formatting issues")
