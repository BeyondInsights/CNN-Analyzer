#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Check lines 800-829 for issues
print("Checking for syntax issues before line 830...")

bracket_stack = []
for i in range(800, min(829, len(lines))):
    line = lines[i]
    for char in line:
        if char in '({[':
            bracket_stack.append((char, i+1))
        elif char in ')}]':
            if not bracket_stack:
                print(f"Extra closing bracket '{char}' at line {i+1}")
            else:
                opening, line_num = bracket_stack.pop()
                expected = {'(': ')', '{': '}', '[': ']'}
                if expected[opening] != char:
                    print(f"Mismatched bracket: '{opening}' at line {line_num} closed with '{char}' at line {i+1}")

if bracket_stack:
    print("Unclosed brackets:")
    for bracket, line_num in bracket_stack:
        print(f"  '{bracket}' opened at line {line_num}")

# Check for other issues
for i in range(815, min(829, len(lines))):
    line = lines[i].strip()
    if line and not line.startswith('//'):
        print(f"Line {i+1}: {line[:50]}...")
