#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Remove any existing EnhancedProductProfiles components (commented or not)
import re
content = re.sub(r'{/\*.*?EnhancedProductProfiles.*?\*/}', '', content, flags=re.DOTALL)
content = re.sub(r'<EnhancedProductProfiles[^>]*?/>', '', content)

# Find the closing of the main component (before the final return statement ends)
# Add the modal with conditional rendering
modal_code = '''
      {/* Demographic Profiles Modal - Conditionally Rendered */}
      {showDemographicProfiles && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <EnhancedProductProfiles
            isVisible={true}
            onClose={() => {
              console.log("Closing demographics modal");
              setShowDemographicProfiles(false);
            }}
            productProfiles={demographicProfileData || []}
            totalRespondents={2158}
          />
        </div>
      )}'''

# Find the last </div> before the closing of the Page function
lines = content.split('\n')
for i in range(len(lines) - 1, 0, -1):
    if '</div>' in lines[i]:
        # Check if this is the main container closing
        if i < len(lines) - 5:  # Not the very last one
            lines.insert(i, modal_code)
            print(f"✓ Added modal at line {i}")
            break

content = '\n'.join(lines)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Modal should now render when state is true")
