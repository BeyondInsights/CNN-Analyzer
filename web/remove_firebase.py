#!/usr/bin/env python3
import os
import re
import json

print("🔥 Removing Firebase Dependencies")
print("=" * 50)

# Files that might have Firebase imports
files_to_clean = [
    'src/app/actions.ts',
    'src/lib/simulatorClient.ts',
    'src/lib/firebaseClient.ts',
    'src/lib/serverDataLoader.ts',
    'src/app/page.tsx',
    'src/lib/httpSimulation.ts'
]

for filepath in files_to_clean:
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_length = len(content)
    
    # Remove Firebase imports
    content = re.sub(r'^import.*firebase.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^import.*firebaseClient.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^import.*simulatorClient.*$', '', content, flags=re.MULTILINE)
    
    # Remove Firebase initialization
    content = re.sub(r'const\s+app\s*=\s*initializeApp.*?;', '', content)
    content = re.sub(r'const\s+auth\s*=\s*getAuth.*?;', '', content)
    content = re.sub(r'const\s+db\s*=\s*getFirestore.*?;', '', content)
    content = re.sub(r'const\s+storage\s*=\s*getStorage.*?;', '', content)
    
    # Clean up empty lines
    content = re.sub(r'\n\n+', '\n\n', content)
    
    if len(content) < original_length:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✓ Cleaned {filepath}")

print("\n✅ Firebase imports removed")
