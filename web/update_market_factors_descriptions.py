#!/usr/bin/env python3
import re

# Read the MarketFactorsModal component
with open('src/components/MarketFactorsModal.tsx', 'r') as f:
    content = f.read()

# Replace the tooltip descriptions with better ones
replacements = [
    ('How well your target market knows about your product',
     'Percentage of target audience aware the product exists. Industry benchmarks: New launch 20-40%, Established brand 60-80%, Market leader 80-95%'),
    
    ('How easily customers can access your product',
     'Ability to purchase and access across devices/platforms. Consider: Payment methods accepted (70-90%), Technical requirements met (80-95%), Geographic availability (85-100%)'),
    
    ('Your advantage compared to alternatives',
     'Relative strength vs. competitors. Weak position (50-70%): Many strong alternatives. Parity (70-85%): Similar to competitors. Strong advantage (85-100%): Clear differentiation'),
    
    ('How well your marketing converts to customers',
     'Conversion rate from marketing exposure to purchase. Poor execution (40-60%), Average campaigns (60-80%), Best-in-class creative & targeting (80-95%)'),
    
    ('Expected adoption speed in the first year',
     'What % of eventual subscribers join in Year 1. Conservative/Slow (40-60%): Gradual word-of-mouth. Moderate (60-75%): Typical launch. Aggressive (75-90%): Heavy promotion, viral growth')
]

for old_text, new_text in replacements:
    content = content.replace(old_text, new_text)

# Also add recommended settings for different scenarios
scenario_guide = '''
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: '#f0f8ff', 
                borderRadius: '8px',
                border: '1px solid #1976d2'
              }}>
                <strong>Quick Scenario Presets:</strong><br/>
                <br/>
                <strong>Conservative Launch (Reality Check):</strong><br/>
                • All factors at 50-60% - Use for realistic Year 1 projections<br/>
                <br/>
                <strong>Established Brand Entry:</strong><br/>
                • Awareness: 70%, Distribution: 85%, Competitive: 75%, Marketing: 70%, Year One: 65%<br/>
                <br/>
                <strong>Optimistic Best Case:</strong><br/>
                • All factors at 80-90% - Assumes flawless execution<br/>
                <br/>
                <strong>CNN+ Historical Benchmark:</strong><br/>
                • All factors at 60% - Matches actual CNN+ performance
              </div>'''

# Add the scenario guide before the closing of the factors section
content = re.sub(
    r'(</div>\s*{\* Market Factors Section \*})',
    scenario_guide + r'\n\1',
    content
)

with open('src/components/MarketFactorsModal.tsx', 'w') as f:
    f.write(content)

print("✓ Updated Market Factors descriptions")
