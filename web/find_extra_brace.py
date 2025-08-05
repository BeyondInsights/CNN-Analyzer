#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Start from Page function and track where we get the extra brace
brace_count = 0
for i in range(124, 823):  # From Page function to line 823
    line = lines[i]
    old_count = brace_count
    brace_count += line.count('{') - line.count('}')
    
    # Log when we go from level 1 to level 2
    if old_count == 1 and brace_count == 2:
        print(f"Line {i+1}: Extra opening brace here!")
        print(f"  Content: {line.strip()[:80]}")
        
print(f"\nFinal brace count at line 823: {brace_count}")
