#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Check for any malformed JSX around line 830
for i in range(825, min(835, len(lines))):
    line = lines[i]
    if 'alert(' in line and '\\n' in line:
        # Fix the alert string formatting
        lines[i] = line.replace('\\n\\n', '\\\\n\\\\n').replace('\\n', '\\\\n')

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)

print("✓ Fixed syntax error")
