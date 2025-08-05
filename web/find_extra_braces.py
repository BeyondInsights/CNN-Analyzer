#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Track brace balance
balance = 0
for i, line in enumerate(lines[124:], 125):  # Start from line 125 (Page function)
    for char in line:
        if char == '{':
            balance += 1
        elif char == '}':
            balance -= 1
            if balance < 0:
                print(f"Extra closing brace at line {i}: {line.strip()[:50]}")
                balance = 0  # Reset to continue checking

print(f"Final balance: {balance}")
