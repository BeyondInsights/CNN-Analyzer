#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the Page function
page_start = -1
for i, line in enumerate(lines):
    if 'export default function Page()' in line:
        page_start = i
        print(f"Page function starts at line {i+1}")
        break

# Track braces and find where we go wrong
if page_start >= 0:
    brace_count = 0
    for i in range(page_start, min(len(lines), page_start + 750)):
        line = lines[i]
        open_count = line.count('{')
        close_count = line.count('}')
        brace_count += open_count - close_count
        
        # Check for returns
        if 'return (' in line or 'return <' in line:
            print(f"Line {i+1}: Found return, brace level = {brace_count}")
            if brace_count != 1:
                print(f"  ERROR: Should be at level 1, but at level {brace_count}")
        
        if brace_count == 0 and i > page_start:
            print(f"Line {i+1}: Page function closes (brace level 0)")
            if i < 829:
                print(f"  ERROR: Page function closes before line 829!")
            break
