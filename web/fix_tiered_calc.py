#!/usr/bin/env python3

with open('src/app/api/simulation/route.ts', 'r') as f:
    content = f.read()

# Add tiered calculation logic
tiered_logic = '''    // Format results based on report type
    let reportData;
    
    if (reportType === 'tiered' || reportType === 'bundle') {
      // For tiered: first column is ANY product, rest are individual
      const anyProductRate = results?.anyProductRate || 
        results?.takeRates?.reduce((sum: number, t: any) => sum + (t.adjustedTakeRate || 0), 0) || 0;
      
      reportData = {
        reportType: reportType || 'tiered',
        outputType: outputType || 'percentage',
        overallShare: [
          anyProductRate,
          ...results?.takeRates?.map((t: any) => t.adjustedTakeRate || 0) || []
        ],
        segmentShares: Object.entries(results?.segmentResults || {}).map(([name, data]: [string, any]) => ({
          segmentName: name,
          shares: [
            data.anyProductRate || 0,
            ...data.takeRates?.map((t: any) => t.adjustedTakeRate || 0) || []
          ]
        }))
      };
    } else {'''

# Replace the format results section
import re
content = re.sub(
    r'// Format results.*?const reportData = {',
    tiered_logic + '\n      reportData = {',
    content,
    flags=re.DOTALL
)

# Close the if statement
content = re.sub(
    r'(reportType: reportType.*?}\);)',
    r'\1\n    }',
    content,
    flags=re.DOTALL
)

with open('src/app/api/simulation/route.ts', 'w') as f:
    f.write(content)

print("✓ Fixed tiered calculation")
