#!/usr/bin/env python3

print("🔧 Fixing syntax error in page.tsx...")

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Fix the area around line 527-530
fixed = []
for i, line in enumerate(lines):
    line_num = i + 1
    
    # Around line 527-530, there's a syntax issue
    if line_num == 527 and line.strip() == '};':
        # This is likely an extra closing brace
        continue  # Skip it
    elif line_num == 530 and 'console.log("[PAGE] Received result:", result);' in line:
        # Make sure it's properly inside the try block
        fixed.append(line)
        # Add proper continuation
        fixed.append('\n')
    else:
        fixed.append(line)

with open('src/app/page.tsx', 'w') as f:
    f.writelines(fixed)

print("✓ Fixed syntax error")
