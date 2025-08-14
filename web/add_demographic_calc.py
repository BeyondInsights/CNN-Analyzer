#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add demographic calculation after report data is set
demographic_calc = '''
        // Calculate demographic profiles for each product
        if (result.data && result.data.segmentShares) {
          const profiles = activeConfigured.map((product, idx) => {
            // Build demographic profile for this product
            const demographics = {
              age: {},
              income: {},
              gender: {},
              education: {},
              politicalAffiliation: {}
            };
            
            // Extract from segment data
            result.data.segmentShares.forEach(segment => {
              const share = segment.shares[idx];
              if (segment.segmentName.includes('18-34')) demographics.age['18-34'] = share;
              if (segment.segmentName.includes('35-54')) demographics.age['35-54'] = share;
              if (segment.segmentName.includes('55-74')) demographics.age['55-74'] = share;
              if (segment.segmentName === 'Male') demographics.gender['Male'] = share;
              if (segment.segmentName === 'Female') demographics.gender['Female'] = share;
            });
            
            return {
              productName: product.product,
              respondentIds: [], // Would need actual IDs from simulation
              demographics
            };
          });
          
          // Add ANY PRODUCT profile
          const anyProductProfile = {
            productName: 'ANY PRODUCT',
            respondentIds: [],
            demographics: {
              age: {},
              income: {},
              gender: {},
              education: {},
              politicalAffiliation: {}
            }
          };
          
          result.data.segmentShares.forEach(segment => {
            const anyShare = segment.shares.reduce((sum, s) => Math.max(sum, s), 0);
            if (segment.segmentName.includes('18-34')) anyProductProfile.demographics.age['18-34'] = anyShare;
            if (segment.segmentName.includes('35-54')) anyProductProfile.demographics.age['35-54'] = anyShare;
            if (segment.segmentName.includes('55-74')) anyProductProfile.demographics.age['55-74'] = anyShare;
            if (segment.segmentName === 'Male') anyProductProfile.demographics.gender['Male'] = anyShare;
            if (segment.segmentName === 'Female') anyProductProfile.demographics.gender['Female'] = anyShare;
          });
          
          setDemographicProfileData([anyProductProfile, ...profiles]);
        }'''

# Find where reportData is set and add demographic calculation
pattern = r'(setReportData\(result\.data.*?\);)'
content = re.sub(pattern, r'\1\n' + demographic_calc, content, count=1)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added demographic calculation")
