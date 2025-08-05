import json
import os

print("\n🧪 Testing local data setup...")

# Check data files exist
data_files = [
    'src/data/respondentUtilities.json',
    'src/data/respondentProfile.json', 
    'src/data/modelParameters.json',
    'src/data/drnRates.json'
]

all_good = True
for file in data_files:
    if os.path.exists(file):
        with open(file, 'r') as f:
            data = json.load(f)
            if isinstance(data, list):
                print(f"✓ {file}: {len(data)} items")
            elif isinstance(data, dict):
                print(f"✓ {file}: {len(data)} keys")
    else:
        print(f"✗ Missing: {file}")
        all_good = False

if all_good:
    print("\n✅ All data files present and valid")
else:
    print("\n⚠️ Some data files missing")

# Check for Firebase imports
print("\n🔍 Checking for remaining Firebase references...")
import subprocess
result = subprocess.run(['grep', '-r', 'firebase', 'src/', '--include=*.ts', '--include=*.tsx'], 
                       capture_output=True, text=True)
if result.stdout:
    print("⚠️ Found Firebase references:")
    for line in result.stdout.split('\n')[:5]:
        if line:
            print(f"  {line}")
else:
    print("✓ No Firebase references found")
