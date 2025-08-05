#!/usr/bin/env python3

with open('src/components/ReportDisplay.tsx', 'r') as f:
    lines = f.readlines()

# Find and fix the problematic section around line 69-76
fixed = []
for i, line in enumerate(lines):
    line_num = i + 1
    
    # Skip the broken debug section (lines 70-76)
    if line_num >= 70 and line_num <= 76:
        if line_num == 70:
            # Keep the if statement but make it valid
            fixed.append('  if (reportData.overallShare.length !== expectedColumns) {\n')
            fixed.append('    console.warn("Column mismatch:", {\n')
            fixed.append('      dataColumns: reportData.overallShare.length,\n')
            fixed.append('      expectedColumns,\n')
            fixed.append('      filteredProductsCount: filteredProducts.length\n')
            fixed.append('    });\n')
            fixed.append('  }\n')
        continue
    else:
        fixed.append(line)

with open('src/components/ReportDisplay.tsx', 'w') as f:
    f.writelines(fixed)

print("✓ Fixed ReportDisplay.tsx syntax")
