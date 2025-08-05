import re

with open('src/app/actions.ts', 'r') as f:
    content = f.read()

# Replace Firebase imports with local data imports
new_imports = '''// Local data loading - no Firebase needed
import { loadLocalData } from '@/lib/localDataLoader';
import { performSimulation } from '@/lib/calculations';
'''

# Remove old imports and add new ones
content = re.sub(r'^import.*from.*firebase.*$', '', content, flags=re.MULTILINE)
content = re.sub(r'^import.*simulatorClient.*$', '', content, flags=re.MULTILINE)

# Add new imports at the top
lines = content.split('\n')
# Find first non-import line
for i, line in enumerate(lines):
    if line.strip() and not line.startswith('import') and not line.startswith('//'):
        lines.insert(i, new_imports)
        break

# Replace data loading logic
content = '\n'.join(lines)

# Replace any Firebase data loading with local data loading
content = re.sub(
    r'await\s+loadDataFromStorage\(\)',
    'await loadLocalData()',
    content
)

content = re.sub(
    r'await\s+loadServerData\(\)',
    'await loadLocalData()',
    content
)

with open('src/app/actions.ts', 'w') as f:
    f.write(content)

print("✓ Updated actions.ts to use local data")
