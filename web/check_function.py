#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find where Page function starts
for i, line in enumerate(lines):
    if 'export default function Page()' in line:
        print(f"Page function starts at line {i+1}")
        break

# Count braces from Page function start to line 829
brace_count = 0
for i in range(124, 829):  # From line 125 to 829
    if i < len(lines):
        brace_count += lines[i].count('{') - lines[i].count('}')
        
print(f"Brace balance from Page start to line 829: {brace_count}")

# If positive, we're inside the function
if brace_count > 0:
    print("✓ We are inside the Page function")
else:
    print("✗ We are NOT inside the Page function - this is the problem!")
