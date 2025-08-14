#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the View Demographics button click handler and fix it
old_check = r'''onClick=\{\(\) => \{
              if \(true\) \{
                setShowDemographicProfiles\(true\);
              \} else \{
                alert\('Please run a simulation first to view demographic profiles'\);
              \}
            \}\}'''

# Replace with a simpler version that doesn't check reportData
new_check = '''onClick={() => {
              setShowDemographicProfiles(true);
            }}'''

# Try a simpler pattern
pattern = r"alert\('Please run a simulation first to view demographic profiles'\)"
if pattern in content:
    # Just remove the entire if/else and always open the modal
    content = re.sub(
        r'if \(.*?\) \{\s*setShowDemographicProfiles\(true\);\s*\} else \{\s*alert\([^)]*\);\s*\}',
        'setShowDemographicProfiles(true);',
        content
    )
    print("✓ Removed alert condition")

# Also make sure the button is always enabled after simulation
content = re.sub(r'disabled=\{[^}]*\}', 'disabled={false}', content)
print("✓ Button always enabled")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
