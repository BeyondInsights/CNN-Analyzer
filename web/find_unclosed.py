#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Track specific blocks
blocks = []
for i in range(124, 823):
    line = lines[i].strip()
    
    # Track opening of named functions/blocks
    if 'const downloadReport = () => {' in line:
        blocks.append(('downloadReport', i+1))
    elif line.endswith('{'):
        # Track the end of this block
        brace_count = 1
        for j in range(i+1, min(len(lines), 823)):
            brace_count += lines[j].count('{') - lines[j].count('}')
            if brace_count == 0:
                # This block closes at line j
                if blocks and blocks[-1][1] == i+1:
                    blocks[-1] = (blocks[-1][0], i+1, j+1)
                break
        else:
            # Didn't close before line 823
            if blocks and blocks[-1][1] == i+1:
                print(f"UNCLOSED: {blocks[-1][0]} starting at line {blocks[-1][1]} doesn't close before line 823")

# Check downloadReport specifically
for i in range(777, 823):
    if 'downloadReport' in lines[i]:
        print(f"Line {i+1}: {lines[i].strip()[:80]}")
    if i == 817 and '};' in lines[i]:
        print(f"Line {i+1}: downloadReport appears to close here")
    if i == 818 and '}' in lines[i]:
        print(f"Line {i+1}: Extra closing brace?")
