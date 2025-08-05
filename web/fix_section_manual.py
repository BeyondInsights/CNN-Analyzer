#!/usr/bin/env python3

# Read the file
with open('src/lib/calculations.ts', 'r') as f:
    lines = f.readlines()

# Fix specific line numbers
new_lines = []
for i, line in enumerate(lines):
    line_num = i + 1
    
    # Skip the bad lines
    if line_num == 300 and "'feature' === undefined" in line:
        continue  # Skip this nonsensical line
    if line_num == 302 and "if (!feature) continue" in line:
        continue  # Skip this - feature doesn't exist here
    
    new_lines.append(line)

# Write back
with open('src/lib/calculations.ts', 'w') as f:
    f.writelines(new_lines)

print("✓ Fixed calculations.ts by removing bad lines")

# Verify the fix
print("\nChecking the fixed section:")
with open('src/lib/calculations.ts', 'r') as f:
    lines = f.readlines()
    for i in range(297, min(310, len(lines))):
        print(f"{i+1}: {lines[i]}", end='')
