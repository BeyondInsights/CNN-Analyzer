#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update the button to actually open the modal (remove the alert)
content = content.replace(
    'alert("Demographic profiles feature is being integrated. Check back soon!");',
    'setShowDemographicProfiles(true);'
)
print("✓ Updated button to open modal")

# 2. Add demographicProfileData state if missing
if 'demographicProfileData' not in content:
    pattern = r'(const \[showDemographicProfiles, setShowDemographicProfiles\] = useState\(false\);)'
    replacement = r'\1\n  const [demographicProfileData, setDemographicProfileData] = useState<any[]>([]);'
    content = re.sub(pattern, replacement, content)
    print("✓ Added demographicProfileData state")

# 3. Add data extraction after simulation completes
data_extraction = '''
        // Extract demographic profiles from simulation results
        const extractDemographicProfiles = () => {
          if (!result.data || !result.data.segmentShares) return;
          
          const profiles = [];
          
          // Create ANY PRODUCT profile
          const anyProductProfile = {
            productName: 'ANY PRODUCT',
            respondentIds: [],
            demographics: {
              age: {},
              gender: {},
              income: {},
              education: {},
              politicalAffiliation: {}
            }
          };
          
          // Extract age demographics
          result.data.segmentShares.forEach(segment => {
            if (segment.segmentName === '18-34') {
              anyProductProfile.demographics.age['18-34'] = segment.shares[0] || 0;
            } else if (segment.segmentName === '35-54') {
              anyProductProfile.demographics.age['35-54'] = segment.shares[0] || 0;
            } else if (segment.segmentName === '55-74') {
              anyProductProfile.demographics.age['55-74'] = segment.shares[0] || 0;
            } else if (segment.segmentName === 'Male') {
              anyProductProfile.demographics.gender['Male'] = segment.shares[0] || 0;
            } else if (segment.segmentName === 'Female') {
              anyProductProfile.demographics.gender['Female'] = segment.shares[0] || 0;
            }
          });
          
          profiles.push(anyProductProfile);
          
          // Create profiles for each individual product
          activeConfigured.forEach((product, idx) => {
            const productProfile = {
              productName: product.product,
              respondentIds: [],
              demographics: {
                age: {},
                gender: {},
                income: {},
                education: {},
                politicalAffiliation: {}
              }
            };
            
            result.data.segmentShares.forEach(segment => {
              const shareIndex = currentReportTypeState === 'tiered' ? idx + 1 : idx;
              if (segment.segmentName === '18-34') {
                productProfile.demographics.age['18-34'] = segment.shares[shareIndex] || 0;
              } else if (segment.segmentName === '35-54') {
                productProfile.demographics.age['35-54'] = segment.shares[shareIndex] || 0;
              } else if (segment.segmentName === '55-74') {
                productProfile.demographics.age['55-74'] = segment.shares[shareIndex] || 0;
              } else if (segment.segmentName === 'Male') {
                productProfile.demographics.gender['Male'] = segment.shares[shareIndex] || 0;
              } else if (segment.segmentName === 'Female') {
                productProfile.demographics.gender['Female'] = segment.shares[shareIndex] || 0;
              }
            });
            
            profiles.push(productProfile);
          });
          
          setDemographicProfileData(profiles);
          console.log("Demographic profiles extracted:", profiles);
        };
        
        extractDemographicProfiles();'''

# Find where setReportData is called and add extraction after it
pattern = r'(setReportData\(result\.data.*?\);)'
if re.search(pattern, content):
    content = re.sub(pattern, r'\1\n' + data_extraction, content, count=1)
    print("✓ Added demographic extraction after simulation")

# 4. Add the modal component at the end (before final closing)
modal_component = '''
      {/* Enhanced Product Profiles Modal */}
      {showDemographicProfiles && (
        <EnhancedProductProfiles
          isVisible={showDemographicProfiles}
          onClose={() => setShowDemographicProfiles(false)}
          productProfiles={demographicProfileData}
          totalRespondents={2158}
        />
      )}'''

# Check if component already exists
if 'EnhancedProductProfiles' not in content or content.count('EnhancedProductProfiles') < 2:
    # Add before the last closing </div>
    lines = content.split('\n')
    for i in range(len(lines) - 1, 0, -1):
        if '</div>' in lines[i] and lines[i-1].strip() != '':
            lines.insert(i, modal_component)
            print(f"✓ Added modal component at line {i}")
            break
    content = '\n'.join(lines)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ Full demographic integration complete!")
