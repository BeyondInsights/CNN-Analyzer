#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add state variables if they don't exist
if 'showDemographicProfiles' not in content:
    # Find a good place to add state (after other useState declarations)
    pattern = r'(const \[showAttributeImpact, setShowAttributeImpact\] = useState\(false\);)'
    state_vars = '''
  const [showDemographicProfiles, setShowDemographicProfiles] = useState(false);
  const [demographicProfileData, setDemographicProfileData] = useState<any[]>([]);'''
    content = re.sub(pattern, r'\1' + state_vars, content)
    print("✓ Added state variables")

# 2. Update the button to actually work
old_button = r"alert\('Demographic profiles feature coming soon! Data is available but display component needs configuration\.'\);"
new_button = "setShowDemographicProfiles(true);"
content = content.replace(old_button, new_button)
content = content.replace("// TODO: setShowDemographicProfiles(true);", "")
print("✓ Fixed button functionality")

# 3. Add data population after simulation runs
if 'setDemographicProfileData' not in content or content.count('setDemographicProfileData') < 2:
    # Add demographic data extraction after setReportData
    demographic_calc = '''
        // Extract demographic profiles from report data
        if (result.data) {
          const profiles = [];
          
          // Add ANY PRODUCT profile first
          profiles.push({
            productName: 'ANY PRODUCT',
            respondentIds: [],
            demographics: {
              age: {
                '18-34': result.data.segmentShares?.find(s => s.segmentName === '18-34')?.shares[0] || 0,
                '35-54': result.data.segmentShares?.find(s => s.segmentName === '35-54')?.shares[0] || 0,
                '55-74': result.data.segmentShares?.find(s => s.segmentName === '55-74')?.shares[0] || 0
              },
              gender: {
                'Male': result.data.segmentShares?.find(s => s.segmentName === 'Male')?.shares[0] || 0,
                'Female': result.data.segmentShares?.find(s => s.segmentName === 'Female')?.shares[0] || 0
              },
              income: {},
              education: {},
              politicalAffiliation: {}
            }
          });
          
          // Add individual product profiles
          activeConfigured.forEach((product, idx) => {
            profiles.push({
              productName: product.product,
              respondentIds: [],
              demographics: {
                age: {
                  '18-34': result.data.segmentShares?.find(s => s.segmentName === '18-34')?.shares[idx + 1] || 0,
                  '35-54': result.data.segmentShares?.find(s => s.segmentName === '35-54')?.shares[idx + 1] || 0,
                  '55-74': result.data.segmentShares?.find(s => s.segmentName === '55-74')?.shares[idx + 1] || 0
                },
                gender: {
                  'Male': result.data.segmentShares?.find(s => s.segmentName === 'Male')?.shares[idx + 1] || 0,
                  'Female': result.data.segmentShares?.find(s => s.segmentName === 'Female')?.shares[idx + 1] || 0
                },
                income: {},
                education: {},
                politicalAffiliation: {}
              }
            });
          });
          
          setDemographicProfileData(profiles);
        }'''
    
    # Find setReportData and add after it
    pattern = r'(setReportData\(reportData\);)'
    content = re.sub(pattern, r'\1' + demographic_calc, content, count=1)
    print("✓ Added demographic data extraction")

# 4. Make sure the component is properly rendered (not commented out)
if '{/* <EnhancedProductProfiles' in content:
    content = content.replace('{/* <EnhancedProductProfiles', '<EnhancedProductProfiles')
    content = content.replace('totalRespondents={2158}\n/> */}', 'totalRespondents={2158}\n/>')
    print("✓ Uncommented component")

# 5. Ensure component is at the end before closing
if '<EnhancedProductProfiles' not in content or content.count('<EnhancedProductProfiles') < 1:
    component = '''
      {/* Enhanced Product Profiles Modal */}
      <EnhancedProductProfiles
        isVisible={showDemographicProfiles}
        onClose={() => setShowDemographicProfiles(false)}
        productProfiles={demographicProfileData}
        totalRespondents={2158}
      />'''
    
    # Add before the final closing div
    pattern = r'(</div>\s*\);\s*}\s*$)'
    content = re.sub(pattern, component + r'\n\1', content)
    print("✓ Added component rendering")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ Demographics feature fully integrated!")
