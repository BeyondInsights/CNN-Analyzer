#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the Page function declaration around line 124
for i in range(120, 130):
    if i < len(lines) and 'export default function Page()' in lines[i]:
        print(f"Found Page function at line {i+1}: {lines[i].strip()}")
        # Make sure it has an opening brace
        if '{' not in lines[i]:
            lines[i] = 'export default function Page() {\n'
            print("Fixed: Added opening brace")
        break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)
