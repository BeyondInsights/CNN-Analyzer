#!/usr/bin/env python3
import re

print("🔧 Fixing frontend result handling...")

# Fix page.tsx to handle the result properly
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the handleSimulation function and fix result handling
pattern = r'if \(result && result\.data\) \{[\s\S]*?setReportData\(result\.data\);'
replacement = '''if (result && result.data) {
      console.log("[PAGE] Setting report data:", result.data);
      setReportData(result.data);'''

content = re.sub(pattern, replacement, content)

# Also add logging to see what's received
pattern2 = r'const result = await runSecureSimulation\('
replacement2 = 'const result = await runSecureSimulation('
content = re.sub(pattern2, replacement2 + '\n    console.log("[PAGE] Received result:", result);', content, count=1)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added logging to page.tsx")

# Fix httpSimulation.ts to log what it returns
with open('src/lib/httpSimulation.ts', 'r') as f:
    content = f.read()

# Add logging before return
if 'console.log("Returning to page:", {' not in content:
    content = re.sub(
        r'return \{\s*success: true,\s*data\s*\};',
        '''console.log("Returning to page:", { success: true, dataKeys: Object.keys(data) });
    return {
      success: true,
      data
    };''',
        content
    )

with open('src/lib/httpSimulation.ts', 'w') as f:
    f.write(content)

print("✓ Added logging to httpSimulation.ts")
