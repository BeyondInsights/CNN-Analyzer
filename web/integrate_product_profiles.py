#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add import if missing
if 'EnhancedProductProfiles' not in content:
    # Add import after other component imports
    import_line = "import EnhancedProductProfiles from '@/components/EnhancedProductProfiles';"
    pattern = r"(import.*from '@/components/.*?';)"
    content = re.sub(pattern, r'\1\n' + import_line, content, count=1)
    print("✓ Added import")

# 2. Add state for showing profiles
if 'showDemographicProfiles' not in content:
    state_line = '\n  const [showDemographicProfiles, setShowDemographicProfiles] = useState(false);'
    state_line += '\n  const [demographicProfileData, setDemographicProfileData] = useState([]);'
    pattern = r'(const \[showPricingGuide, setShowPricingGuide\] = useState\(false\);)'
    content = re.sub(pattern, r'\1' + state_line, content, count=1)
    print("✓ Added state")

# 3. Add button to view demographic profiles (after Run Simulation button)
profile_button = '''
          <button
            className={`${styles.headerButton} ${styles.profileButton}`}
            onClick={() => {
              if (reportData) {
                setShowDemographicProfiles(true);
              } else {
                alert('Please run a simulation first to view demographic profiles');
              }
            }}
            disabled={!reportData || isSimulating}
          >
            <span className={styles.iconSpacing}>👥</span> View Demographics
          </button>'''

if 'View Demographics' not in content:
    pattern = r'(Run Simulation\s*</button>)'
    content = re.sub(pattern, r'\1' + profile_button, content, count=1)
    print("✓ Added button")

# 4. Add the component at the end (before closing div)
profile_component = '''
      {/* Enhanced Product Profiles Modal */}
      <EnhancedProductProfiles
        isVisible={showDemographicProfiles}
        onClose={() => setShowDemographicProfiles(false)}
        productProfiles={demographicProfileData}
        totalRespondents={2158}
      />'''

if '<EnhancedProductProfiles' not in content:
    # Add before the final closing div
    pattern = r'(</div>\s*\);\s*}\s*$)'
    content = re.sub(pattern, profile_component + r'\n\1', content)
    print("✓ Added component")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ EnhancedProductProfiles integrated!")
