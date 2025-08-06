#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find and fix the broken message string
# Replace the problematic multiline string with proper JavaScript template literal
broken_pattern = r"const message = 'Pricing Structure Warning:\n\n' \+ \s*warnings\.join\('\n'\) \+ \s*'\n\nThis pricing structure is uncommon and may not reflect real market behavior\.\n\nContinue anyway\?';"

fixed_message = '''const message = `Pricing Structure Warning:\\n\\n${warnings.join('\\n')}\\n\\nThis pricing structure is uncommon and may not reflect real market behavior.\\n\\nContinue anyway?`;'''

# Try to find and replace the broken string
if "const message = 'Pricing Structure Warning:" in content:
    # Find the section and replace it
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        if "const message = 'Pricing Structure Warning:" in lines[i]:
            # Skip all the broken lines and add the fixed version
            new_lines.append('          ' + fixed_message)
            # Skip ahead past the broken lines
            while i < len(lines) and "Continue anyway?" not in lines[i]:
                i += 1
            i += 1  # Skip the line with "Continue anyway?" too
        else:
            new_lines.append(lines[i])
            i += 1
    
    content = '\n'.join(new_lines)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed string syntax error")
