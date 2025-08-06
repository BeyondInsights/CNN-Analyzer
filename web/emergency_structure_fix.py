#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Ensure Page function has proper structure
if 'export default function Page()' in content and 'export default function Page() {' not in content:
    content = content.replace('export default function Page()', 'export default function Page() {')
    print("Fixed Page function declaration")

# Make sure file ends with closing brace
if not content.rstrip().endswith('}'):
    content = content.rstrip() + '\n}'
    print("Added closing brace at end")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Structure fixed")
