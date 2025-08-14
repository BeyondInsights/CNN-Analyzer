#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Make sure the button sets showDemographicProfiles
import re
pattern = r'onClick=\{\(\) => \{[^}]*setShowDemographicProfiles\(true\)[^}]*\}\}'
if not re.search(pattern, content):
    # Find the View Demographics button and fix it
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'View Demographics' in line:
            # Look for the onClick in nearby lines
            for j in range(max(0, i-5), min(len(lines), i+5)):
                if 'onClick' in lines[j] and 'setShowDemographicProfiles' in lines[j]:
                    lines[j] = '            onClick={() => setShowDemographicProfiles(true)}'
                    print(f"✓ Fixed onClick at line {j+1}")
                    break
    content = '\n'.join(lines)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
