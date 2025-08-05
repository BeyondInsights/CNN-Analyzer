import os
import re

print("\n🔍 Verifying fixes...")
issues = []

# Check httpSimulation.ts
if os.path.exists('src/lib/httpSimulation.ts'):
    with open('src/lib/httpSimulation.ts', 'r') as f:
        content = f.read()
    if 'return {' in content and 'success: true' in content:
        issues.append("httpSimulation.ts still returns wrapped result")
    else:
        print("✓ httpSimulation.ts returns data directly")

# Check calculations.ts
if os.path.exists('src/lib/calculations.ts'):
    with open('src/lib/calculations.ts', 'r') as f:
        content = f.read()
    if 'MODEL_CALIBRATION_FACTOR' not in content:
        issues.append("calculations.ts missing calibration factor")
    else:
        print("✓ calculations.ts has calibration factor")

# Check for debug logs
for file in ['src/app/actions.ts', 'src/lib/calculations.ts']:
    if os.path.exists(file):
        with open(file, 'r') as f:
            if 'console.log' in f.read() and 'DEBUG' in f.read():
                issues.append(f"{file} still has debug logs")

if not issues:
    print("\n✅ All checks passed!")
else:
    print("\n⚠️ Issues found:")
    for issue in issues:
        print(f"  - {issue}")
