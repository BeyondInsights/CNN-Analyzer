#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Just update the tooltip content that already exists
replacements = [
    ('How well your target market knows about your product',
     '% aware product exists. New: 20-40%, Established: 60-80%, Leader: 80-95%'),
    
    ('How easily customers can access your product',
     'Payment/platform access. Basic: 70%, Good: 85%, Excellent: 95%'),
    
    ('Your advantage compared to alternatives',
     'vs. competitors. Weak: 50-70%, Parity: 70-85%, Strong: 85-100%'),
    
    ('How well your marketing converts to customers',
     'Conversion rate. Poor: 40-60%, Average: 60-80%, Best: 80-95%'),
    
    ('Expected adoption speed in the first year',
     'Y1 adoption %. Conservative: 40-60%, Moderate: 60-75%, Aggressive: 75-90%')
]

changes = 0
for old_text, new_text in replacements:
    if old_text in content:
        content = content.replace(old_text, new_text)
        changes += 1
        print(f"✓ Updated: {old_text[:30]}...")

print(f"Made {changes} tooltip updates")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
