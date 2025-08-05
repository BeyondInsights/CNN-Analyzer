#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find where brace count goes to 0
brace_count = 0
for i in range(124, len(lines)):
    brace_count += lines[i].count('{') - lines[i].count('}')
    if brace_count == 0 and i > 124:
        print(f"Page function closes at line {i+1}")
        print(f"Content: {lines[i].strip()}")
        break

# Check what's between the closing and line 830
print("\nLines around the premature closing:")
for j in range(max(0, i-2), min(i+3, len(lines))):
    print(f"{j+1}: {lines[j].rstrip()}")
