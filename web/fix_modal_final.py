#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the commented out component and replace with proper one
import re

# Remove any commented version
content = re.sub(r'{/\*.*?<EnhancedProductProfiles.*?\*/}', '', content, flags=re.DOTALL)

# Add the working modal at the end, before the last </div>
modal = '''
      {/* Enhanced Product Profiles Modal */}
      <EnhancedProductProfiles
        isVisible={showDemographicProfiles}
        onClose={() => setShowDemographicProfiles(false)}
        productProfiles={demographicProfileData || []}
        totalRespondents={2158}
      />'''

# Find the last </div> and add before it
lines = content.split('\n')
for i in range(len(lines) - 1, 0, -1):
    if '</div>' in lines[i] and ')' in lines[i]:  # Last closing div of the component
        lines.insert(i, modal)
        print(f"✓ Added modal at line {i}")
        break

content = '\n'.join(lines)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed EnhancedProductProfiles modal")
