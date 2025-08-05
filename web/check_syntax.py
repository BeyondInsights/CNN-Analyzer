#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Check lines before 830 for unclosed brackets
brace_count = 0
for i in range(124, 830):  # From Page function start
    if i < len(lines):
        brace_count += lines[i].count('{') - lines[i].count('}')

print(f"Brace count at line 830: {brace_count}")
print("Should be 1 (inside Page function)")

# Check around line 830
print("\nLines 825-835:")
for i in range(824, min(835, len(lines))):
    print(f"{i+1}: {lines[i].rstrip()}")
