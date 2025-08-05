#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find where the buttons are and add our help button
help_button = '''
          <button
            className={styles.headerButton}
            onClick={() => {
              const helpText = `HOW TO USE THE CNN DIGITAL NEWS SIMULATOR\\n\\n` +
                `1. SELECT PRODUCTS: Click numbered buttons (1-8) to include/exclude\\n` +
                `2. CONFIGURE: Choose type, add features, set pricing\\n` +
                `3. RUN: Click green Run Simulation button\\n` +
                `4. REVIEW: Check results by demographic segments\\n\\n` +
                `BUTTONS:\\n` +
                `• Set Report Type: Tiered (compete) vs Independent\\n` +
                `• Market Factors: Adjust real-world constraints (70-90% is optimistic)\\n` +
                `• Price Sensitivity: See adoption at different prices\\n` +
                `• Download Report: Export CSV for Excel\\n\\n` +
                `TIPS:\\n` +
                `• All-Access should win when priced below individuals\\n` +
                `• 35-54 age group typically converts best\\n` +
                `• Try Streaming at $5.99 with 60% factors to match CNN+ benchmark`;
              alert(helpText);
            }}
            style={{ backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold' }}
          >
            <span className={styles.iconSpacing}>📖</span> How to Use
          </button>
'''

# Insert after the Clear All Selections button
content = re.sub(
    r'(Clear All Selections.*?</button>)',
    r'\1\n' + help_button,
    content,
    flags=re.DOTALL
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added working How to Use button")
