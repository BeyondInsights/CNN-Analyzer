#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find where the other header buttons are (around line 450-500)
for i, line in enumerate(lines):
    if 'Price Sensitivity Analysis' in line and 'headerButton' in line:
        # Add the How to Use button right before Price Sensitivity
        indent = '          '
        help_button = f'''{indent}<button
{indent}  className={{styles.headerButton}}
{indent}  onClick={{() => alert('How to Use guide coming soon!')}}
{indent}  style={{{{ backgroundColor: '#28a745' }}}}
{indent}}>
{indent}  <span className={{styles.iconSpacing}}>❓</span> How to Use
{indent}</button>
{indent}
'''
        lines.insert(i, help_button)
        break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)

print("✓ Added How to Use button")
