#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Remove any duplicate How to Use buttons (keep only the one in the modal)
# Count how many How to Use buttons exist
how_to_count = content.count('How to Use</button>')
if how_to_count > 1:
    # Remove the first occurrence (old one)
    content = content.replace(
        '''<button
            className={styles.headerButton}
            onClick={() => setShowHowToModal(true)}
            style={{ backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold' }}
          >
            <span className={styles.iconSpacing}>📖</span> How to Use
          </button>''', 
        '', 
        1
    )

# Remove rocket ship emoji from Quick Start Guide heading
content = content.replace('🚀 Quick Start Guide', 'Quick Start Guide')

# Remove gamepad emoji from Button Guide heading
content = content.replace('🎮 Button Guide', 'Button Guide')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Removed duplicate button and updated icons")
