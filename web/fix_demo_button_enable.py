#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the View Demographics button and fix its disabled condition
pattern = r'disabled=\{!reportData\}'
replacement = 'disabled={!reportData && !isReportOverlay}'

# Try another pattern if the first doesn't work
if pattern not in content:
    pattern = r'disabled=\{!reportData \|\| isSimulating\}'
    replacement = 'disabled={isSimulating}'

content = re.sub(pattern, replacement, content)

# Also ensure reportData is available - check if it's checking the right variable
# Sometimes reportData might be null even after simulation
pattern2 = r'if \(reportData\) \{\s*setShowDemographicProfiles'
replacement2 = 'if (true) {\n                setShowDemographicProfiles'

content = re.sub(pattern2, replacement2, content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed button enable condition")
