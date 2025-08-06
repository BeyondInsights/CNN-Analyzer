#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

brace_count = 0
for i in range(len(lines)):
    brace_count += lines[i].count('{') - lines[i].count('}')
    
    # Check around the error area
    if i == 826:
        print(f"Line {i+1}: Brace count = {brace_count}")
        print(f"Line content: {lines[i].rstrip()}")
        
    if i >= 824 and i <= 832:
        print(f"Line {i+1}: {lines[i].rstrip()} [braces: {brace_count}]")
        
    # Find where we hit 0 (function closes)
    if brace_count == 0 and i > 10 and i < 826:
        print(f"!!! Function closes early at line {i+1}: {lines[i].rstrip()}")
        break
