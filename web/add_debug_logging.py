#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the View Demographics button and add logging
import re

# Add console.log to the button click
pattern = r'(onClick=\{\(\) => \{)\s*(setShowDemographicProfiles\(true\))'
replacement = r'\1\n              console.log("View Demographics clicked!");\n              console.log("Setting showDemographicProfiles to true");\n              \2'
content = re.sub(pattern, replacement, content)

# Also add logging to check if the modal should render
# Find where EnhancedProductProfiles is rendered
pattern2 = r'(<EnhancedProductProfiles)'
replacement2 = r'{console.log("showDemographicProfiles:", showDemographicProfiles) && \1'
content = re.sub(pattern2, replacement2, content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added debug logging")
