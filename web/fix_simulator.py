#!/usr/bin/env python3
import os
import json
import re
import subprocess

print("🔧 CNN Simulator Restoration Script")
print("=" * 50)

# 1. Remove all debug logging to speed things up
print("\n1. Removing debug logs...")
files_to_clean = [
    'src/app/actions.ts',
    'src/lib/calculations.ts', 
    'src/lib/httpSimulation.ts',
    'src/app/page.tsx'
]

for file in files_to_clean:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
        # Remove console.log with DEBUG, CALC, or [ANYTHING]
        cleaned = re.sub(r'^\s*console\.log\(.*(?:DEBUG|CALC|\[.*\]).*\);.*$', '', content, flags=re.MULTILINE)
        with open(file, 'w') as f:
            f.write(cleaned)
        print(f"   ✓ Cleaned {file}")

# 2. Restore from backups if they exist
print("\n2. Restoring from backups...")
backups = {
    'src/lib/calculations.ts.backup': 'src/lib/calculations.ts',
    'src/app/page.tsx.backup': 'src/app/page.tsx'
}

for backup, target in backups.items():
    if os.path.exists(backup) and os.path.getsize(backup) > 0:
        subprocess.run(['cp', backup, target])
        print(f"   ✓ Restored {target} from backup")
    else:
        print(f"   ⚠ No backup found for {target}")

# 3. Fix the data flow issue
print("\n3. Fixing data flow...")

# Fix httpSimulation.ts to return data directly
if os.path.exists('src/lib/httpSimulation.ts'):
    with open('src/lib/httpSimulation.ts', 'r') as f:
        content = f.read()
    
    # Change return {success: true, data: result} to return result
    content = re.sub(
        r'return\s*{\s*success:\s*true,\s*data:\s*result\s*};',
        'return result;',
        content
    )
    
    with open('src/lib/httpSimulation.ts', 'w') as f:
        f.write(content)
    print("   ✓ Fixed httpSimulation.ts return statement")

# 4. Fix page.tsx to handle the result properly
if os.path.exists('src/app/page.tsx'):
    with open('src/app/page.tsx', 'r') as f:
        content = f.read()
    
    # Find and fix setReportData
    content = re.sub(
        r'if\s*\(result\)\s*{\s*setReportData\(result\);',
        '''if (result && result.data) {
        setReportData(result.data);
      } else if (result) {
        setReportData(result);''',
        content
    )
    
    with open('src/app/page.tsx', 'w') as f:
        f.write(content)
    print("   ✓ Fixed page.tsx result handling")

print("\n✅ Restoration complete!")
print("\nNext steps:")
print("1. Kill the current dev server (Ctrl+C)")
print("2. Run: npm run dev")
print("3. Test the simulator")
