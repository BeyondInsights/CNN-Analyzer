#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the headerButtons div and add How to Use as the first button
button_html = '''        <button
          className={styles.headerButton}
          onClick={() => alert('How to Use:\\n\\n1. SELECT PRODUCTS: Click numbered buttons below\\n2. CONFIGURE: Choose type, features, pricing\\n3. RUN: Click green Run Simulation\\n4. ANALYZE: Review results by segment\\n\\nTIPS:\\n• Try $5.99 streaming to match CNN+\\n• All-Access wins when cheaper\\n• 35-54 age converts best')}
          style={{ backgroundColor: '#17a2b8', fontWeight: 'bold' }}
        >
          <span className={styles.iconSpacing}>📖</span> How to Use
        </button>
        '''

# Find the headerButtons div and insert as first child
content = re.sub(
    r'(<div className={styles\.headerButtons}>)\s*\n',
    r'\1\n' + button_html,
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added How to Use button as first button")
