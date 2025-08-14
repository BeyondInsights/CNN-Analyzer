#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the Run Simulation button and add View Demographics after it
import re

# Find the pattern around line 907
pattern = r"(\{isSimulating \? 'Simulating\.\.\.' : 'Run Simulation'\}\s*</button>)"
replacement = r'''\1
          
          <button
            className={styles.headerButton}
            onClick={() => {
              if (reportData) {
                // For now, just show an alert since component needs setup
                alert('Demographic profiles feature coming soon! Data is available but display component needs configuration.');
                // TODO: setShowDemographicProfiles(true);
              } else {
                alert('Please run a simulation first to view demographic profiles');
              }
            }}
            disabled={!reportData}
          >
            <span className={styles.iconSpacing}>👥</span> View Demographics
          </button>'''

content = re.sub(pattern, replacement, content)

# Also uncomment the EnhancedProductProfiles component
content = content.replace('{/* <EnhancedProductProfiles', '<EnhancedProductProfiles')
content = content.replace('/> */}', '/>')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added View Demographics button")
print("✓ Uncommented EnhancedProductProfiles component")
