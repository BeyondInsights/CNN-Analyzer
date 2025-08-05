#!/usr/bin/env python3
import os
import re

print("🧹 Removing final Firebase references...")

# 1. Clean MarketFactorsModal.tsx
if os.path.exists('src/components/MarketFactorsModal.tsx'):
    with open('src/components/MarketFactorsModal.tsx', 'r') as f:
        content = f.read()
    # Remove Firebase auth import
    content = re.sub(r"^import.*firebaseClient.*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^import.*auth.*from.*firebase.*$", '', content, flags=re.MULTILINE)
    # Remove any auth-related code
    content = re.sub(r"auth\.\w+\([^)]*\)", 'null', content)
    with open('src/components/MarketFactorsModal.tsx', 'w') as f:
        f.write(content)
    print("✓ Cleaned MarketFactorsModal.tsx")

# 2. Remove Firebase admin files
files_to_remove = [
    'src/lib/firebaseAdmin.ts',
    'src/lib/secureSimulatorClient.ts',
    'src/lib/firebaseClient.ts'
]
for file in files_to_remove:
    if os.path.exists(file):
        os.remove(file)
        print(f"✓ Removed {file}")

print("✅ Firebase references cleaned")
