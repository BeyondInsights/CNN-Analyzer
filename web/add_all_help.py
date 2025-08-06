#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update Market Factors tooltip content (make them more detailed)
replacements = [
    ('How well your target market knows about your product',
     'Percentage of target audience aware product exists. New launch: 20-40%, Established brand (CNN): 60-80%, Market leader: 80-95%'),
    
    ('How easily customers can access your product',
     'Ability to purchase and access across devices/platforms. Limited: 70%, Good coverage: 85%, Everywhere: 95%'),
    
    ('Your advantage compared to alternatives',
     'Relative strength vs. competitors (NYT, WSJ, Netflix). Weak position: 50-70%, Competitive parity: 70-85%, Strong advantage: 85-100%'),
    
    ('How well your marketing converts to customers',
     'Marketing conversion rate. Basic campaigns: 40-60%, Professional (CNN level): 60-80%, Best-in-class: 80-95%'),
    
    ('Expected adoption speed in the first year',
     'What % of eventual subscribers join in Year 1. Slow/word-of-mouth: 40-60%, Typical launch: 60-75%, Aggressive/viral: 75-90%')
]

changes = 0
for old_text, new_text in replacements:
    if old_text in content:
        content = content.replace(old_text, new_text)
        changes += 1
        print(f"✓ Updated Market Factor: {old_text[:30]}...")

print(f"Updated {changes} Market Factor definitions")

# 2. Add comprehensive Price Sensitivity help section
# Find the Enable Price Sensitivity line
import re
pattern = r'(Enable Price Sensitivity Analysis\s*</label>)'
price_help = '''</label>
              
              {/* Price Sensitivity Help Section */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <h4 style={{ color: '#856404', marginBottom: '0.5rem' }}>📊 How Price Sensitivity Works:</h4>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Price Threshold ($):</strong> The psychological "sticker shock" point<br/>
                  • <strong>$10</strong> = Entertainment benchmark (Netflix, Spotify)<br/>
                  • <strong>$12</strong> = Standard news subscription (RECOMMENDED for CNN)<br/>
                  • <strong>$15</strong> = Premium news (NYT, WSJ, Financial Times)
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Low Price Boost (multiplier):</strong> Extra adoption when priced below threshold<br/>
                  • <strong>1.1x</strong> = 10% boost (customers not very price sensitive)<br/>
                  • <strong>1.3x</strong> = 30% boost (standard market response)<br/>
                  • <strong>1.5x</strong> = 50% boost (very price-conscious market)
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>High Price Penalty (multiplier):</strong> Lost adoption when above threshold<br/>
                  • <strong>0.9x</strong> = 10% penalty (loyal audience, strong brand)<br/>
                  • <strong>0.8x</strong> = 20% penalty (standard market response)<br/>
                  • <strong>0.7x</strong> = 30% penalty (price-sensitive, many alternatives)
                </div>
                
                <div style={{ 
                  padding: '0.5rem', 
                  background: '#ffeaa7', 
                  borderRadius: '4px'
                }}>
                  <strong>Quick Presets:</strong><br/>
                  • <strong>Low Sensitivity:</strong> Premium positioning, loyal audience<br/>
                  • <strong>Standard:</strong> Typical market (USE THIS FOR CNN)<br/>
                  • <strong>High Sensitivity:</strong> Budget-conscious, competitive market
                </div>
              </div>'''

content = re.sub(pattern, r'\1' + price_help, content)
print("✓ Added comprehensive Price Sensitivity help section")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("\n✅ All help text added successfully!")
