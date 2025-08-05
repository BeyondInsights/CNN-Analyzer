#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Look specifically at lines 821-829
print("Lines 821-829:")
for i in range(820, min(829, len(lines))):
    print(f"{i+1}: {lines[i].rstrip()}")

# Check if the if statement is properly closed
print("\nChecking if statement structure...")
in_if = False
for i in range(820, min(829, len(lines))):
    if 'if (!isPasswordAuthenticated)' in lines[i]:
        in_if = True
        print(f"If statement starts at line {i+1}")
    if in_if and '}' in lines[i]:
        print(f"If statement closes at line {i+1}")
        in_if = False
        
if in_if:
    print("WARNING: If statement not closed before return!")
