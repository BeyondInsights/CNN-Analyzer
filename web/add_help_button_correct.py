#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the Clear All Selections button and add How to Use after it
for i, line in enumerate(lines):
    if 'Clear All Selections' in line and '</button>' in lines[i+1]:
        # Insert the How to Use button after the closing </button>
        help_button = '''          
          <button
            className={styles.headerButton}
            onClick={() => {
              const message = 
                'HOW TO USE CNN SIMULATOR\\n\\n' +
                '1. SELECT PRODUCTS: Click numbered buttons (1-8)\\n' +
                '2. CONFIGURE: Choose type, add features, set price\\n' +
                '3. RUN: Click green Run Simulation button\\n' +
                '4. REVIEW: Check results by segments\\n\\n' +
                'KEY BUTTONS:\\n' +
                '• Set Report Type: Tiered vs Independent\\n' +
                '• Market Factors: Adjust real-world constraints\\n' +
                '• Price Sensitivity: See price impact\\n' +
                '• Download Report: Export CSV\\n\\n' +
                'TIPS:\\n' +
                '• 35-54 age group converts best\\n' +
                '• All-Access wins when priced below individuals';
              alert(message);
            }}
            style={{ backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold' }}
          >
            <span className={styles.iconSpacing}>📖</span> How to Use
          </button>
'''
        lines.insert(i+2, help_button)
        print(f"✓ Added How to Use button after line {i+2}")
        break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)
