#!/usr/bin/env python3
import re

with open('src/components/MarketFactorsModal.tsx', 'r') as f:
    content = f.read()

# Replace the CNN-specific insights with more realistic guidance
old_insights = '''<strong>⚠️ CNN-Specific Insights:</strong><br/>
                      • CNN+ launched at $5.99 → Got 0.15% take rate<br/>
                      • Testing shows All-Access needs to be under $10 to succeed<br/>
                      • Reader/Streaming can sustain $11-13 individually<br/>
                      • Standalone verticals work at $3-5<br/>
                      • <em>Recommendation: Use "High Sensitivity" with $10 threshold for CNN</em>'''

new_insights = '''<strong>⚠️ CNN-Specific Insights:</strong><br/>
                      • CNN+ launched at $5.99 → Got 0.15% take rate (too cheap, signaled low value)<br/>
                      • All-Access sweet spot: $9.99-12.99 (must be less than Reader + Streaming)<br/>
                      • Reader/Streaming can sustain $11-14 individually<br/>
                      • Bundle pricing rule: All-Access should be 40-60% of combined individual prices<br/>
                      • Example: Reader $12 + Streaming $14 = $26 → All-Access at $11-13 (50% discount)<br/>
                      • Standalone verticals work best at $3-5<br/>
                      • <em>Recommendation: Use "Standard" with $12 threshold for balanced results</em><br/>
                      • <em>Or use "High Sensitivity" with $15 threshold if targeting premium positioning</em>'''

content = content.replace(old_insights, new_insights)

with open('src/components/MarketFactorsModal.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed price guidance to be more realistic and consistent")
