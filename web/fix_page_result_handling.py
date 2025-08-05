#!/usr/bin/env python3
import re

print("🔧 Fixing result handling in page.tsx...")

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the handleSimulation function
# Look for where it handles the result
pattern = r'if \(!result\) \{[^}]*\}[\s\S]*?if \(result\) \{[^}]*\}'

# Replace with proper handling
replacement = '''if (!result) {
        throw new Error("No result returned from simulation");
      }
      
      // Handle both wrapped and unwrapped results
      let reportData = null;
      if (result.success && result.data) {
        console.log("Using result.data");
        reportData = result.data;
      } else if (result.overallShare) {
        console.log("Using result directly");
        reportData = result;
      } else {
        console.error("Unexpected result format:", result);
        throw new Error("Invalid result format");
      }
      
      if (reportData) {
        console.log("Setting report data:", reportData);
        setReportData(reportData);
        setIsReportOverlay(true);
      }'''

# Find and replace the result handling section
content = re.sub(
    r'if \(!result\) \{.*?\}.*?if \(result.*?\) \{.*?setReportData.*?\}',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed result handling")
