#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the Clear All Selections button and add our help button after it
help_button = '''
          <button
            className={styles.headerButton}
            onClick={() => {
              alert(
                'HOW TO USE CNN SIMULATOR\\n\\n' +
                '1. SELECT PRODUCTS: Click numbered buttons (1-8)\\n' +
                '2. CONFIGURE: Choose type, add features, set price\\n' +
                '3. RUN: Click green Run Simulation\\n' +
                '4. REVIEW: Check results by segments\\n\\n' +
                'BUTTONS:\\n' +
                '• Set Report Type: Tiered vs Independent\\n' +
                '• Market Factors: Adjust constraints (70-90% is optimistic)\\n' +
                '• Price Sensitivity: See adoption at different prices\\n' +
                '• Download Report: Export to CSV\\n\\n' +
                'TIPS:\\n' +
                '• 35-54 age group converts best\\n' +
                '• All-Access wins when priced below individuals'
              );
            }}
            style={{ backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold' }}
          >
            <span className={styles.iconSpacing}>📖</span> How to Use
          </button>'''

# Find and add after Clear All Selections
pattern = r'(Clear All Selections\s*</button>)'
if pattern in content:
    content = re.sub(pattern, r'\1' + help_button, content, count=1)
    print("✓ Added How to Use button")
else:
    print("✗ Could not find Clear All Selections button")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
