#!/usr/bin/env python3

print("🔧 Fixing structure in page.tsx...")

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find and fix the structure issue
fixed = []
for i, line in enumerate(lines):
    line_num = i + 1
    
    # At line 526, after the closing brace, we need to close the simulationOptions object
    if line_num == 526 and '}' in line:
        fixed.append(line)
        # Add the missing closing brace for simulationOptions
        fixed.append('      };\n')  # Close simulationOptions
        continue
    
    # Fix line 529 - the console.log is in the wrong place
    elif line_num == 529 and 'console.log("[PAGE] Received result:"' in line:
        # Skip this line - we'll add it after the function call
        continue
    
    # Fix the runSecureSimulation call
    elif line_num == 528 and 'const result = await runSecureSimulation(' in line:
        fixed.append(line)
        # Add the parameters properly
        fixed.append('        activeConfigured,\n')
        fixed.append('        currentReportTypeState,\n')
        fixed.append('        currentOutputTypeState,\n')
        fixed.append('        marketFactors,\n')
        fixed.append('        simulationOptions\n')
        fixed.append('      );\n')
        fixed.append('      \n')
        fixed.append('      console.log("[PAGE] Received result:", result);\n')
        # Skip the next few lines that have the parameters
        continue
    
    # Skip lines 531-535 as they're the misplaced parameters
    elif line_num >= 531 and line_num <= 535:
        if 'activeConfigured' in line or 'currentReportTypeState' in line or 'currentOutputTypeState' in line or 'marketFactors' in line or 'simulationOptions' in line:
            continue
    
    fixed.append(line)

with open('src/app/page.tsx', 'w') as f:
    f.writelines(fixed)

print("✓ Fixed structure")
