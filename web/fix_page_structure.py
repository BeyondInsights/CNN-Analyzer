#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the line with export default function Page()
page_function_line = -1
for i, line in enumerate(lines):
    if 'export default function Page()' in line:
        page_function_line = i
        print(f"Found Page function at line {i+1}: {line.strip()}")
        
        # Check if it has an opening brace
        if '{' not in line:
            # Add the opening brace
            lines[i] = 'export default function Page() {\n'
            print("Added missing opening brace to Page function")
        break

# If we didn't find it, that's a bigger problem
if page_function_line == -1:
    print("ERROR: Could not find Page function declaration!")
    # Let's add it after the imports
    for i, line in enumerate(lines):
        if line.strip() and not line.startswith('import') and not line.startswith('//'):
            lines.insert(i, '\nexport default function Page() {\n')
            print(f"Added Page function declaration at line {i+1}")
            break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)

print("Fixed Page function structure")
