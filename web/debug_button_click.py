#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the setShowDemographicProfiles(true) line and add logging
for i, line in enumerate(lines):
    if 'setShowDemographicProfiles(true)' in line:
        # Add console.log before it
        indent = len(line) - len(line.lstrip())
        lines[i] = ' ' * indent + 'console.log("Setting showDemographicProfiles to true");\n' + \
                   ' ' * indent + 'console.log("Current value:", showDemographicProfiles);\n' + \
                   line
        print(f"✓ Added logging at line {i+1}")
        break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)
