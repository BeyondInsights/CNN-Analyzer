#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Remove ALL How to Use buttons (we'll add the right one back)
# Pattern 1: Button with onClick alert
pattern1 = r'<button[^>]*>[\s\S]*?How to Use[\s\S]*?</button>'
content = re.sub(pattern1, '', content, count=1)  # Remove first occurrence only

# Pattern 2: Any remaining How to Use button before the modal
lines = content.split('\n')
cleaned_lines = []
skip_lines = 0

for i, line in enumerate(lines):
    if skip_lines > 0:
        skip_lines -= 1
        continue
    
    # If we find a How to Use button that's NOT in the modal
    if 'How to Use' in line and '</button>' in line and '{showHowToModal &&' not in ''.join(lines[max(0,i-20):i]):
        # Skip this button and the lines around it
        j = i
        # Find start of button
        while j > 0 and '<button' not in lines[j]:
            j -= 1
        # Find end of button  
        k = i
        while k < len(lines) and '</button>' not in lines[k]:
            k += 1
        # Skip from j to k
        if j < i:
            # Remove the lines we already added that are part of this button
            lines_to_remove = i - j
            for _ in range(lines_to_remove):
                if cleaned_lines:
                    cleaned_lines.pop()
        skip_lines = k - i
    else:
        cleaned_lines.append(line)

content = '\n'.join(cleaned_lines)

# Now add the ONE correct How to Use button in the header buttons section
# Find where to add it (after Clear All Selections button)
clear_button_pattern = r'(Clear All Selections.*?</button>)'
replacement = r'''\1
          
          <button
            className={styles.headerButton}
            onClick={() => setShowHowToModal(true)}
            style={{ backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold' }}
          >
            <span className={styles.iconSpacing}>📖</span> How to Use
          </button>'''

content = re.sub(clear_button_pattern, replacement, content, flags=re.DOTALL)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Removed all old How to Use buttons and added one clean version")
