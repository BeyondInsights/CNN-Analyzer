#!/usr/bin/env python3
import re

# Find and update the PriceSensitivityControl component or Market Factors modal
with open('src/components/MarketFactorsModal.tsx', 'r') as f:
    content = f.read()

# Add comprehensive price sensitivity documentation
price_sensitivity_guide = '''
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '15px', 
                    background: '#fff9e6', 
                    borderRadius: '8px',
                    border: '1px solid #ffa000',
                    fontSize: '14px'
                  }}>
                    <strong style={{ fontSize: '16px', color: '#f57c00' }}>📊 Price Sensitivity Settings Guide:</strong><br/>
                    <br/>
                    <strong>What It Does:</strong><br/>
                    Adjusts how dramatically price changes affect adoption rates. Real consumers have "psychological price points" where demand drops sharply.<br/>
                    <br/>
                    <strong>Price Threshold ($):</strong><br/>
                    • The "psychological barrier" price point<br/>
                    • Below this: Products seen as "good value" → adoption boost<br/>
                    • Above this: Products seen as "expensive" → adoption penalty<br/>
                    • <em>Recommended: $10 for digital news (Netflix benchmark)</em><br/>
                    • <em>Alternative: $15 for premium positioning (WSJ/NYT benchmark)</em><br/>
                    <br/>
                    <strong>Low Price Boost (multiplier):</strong><br/>
                    • How much extra adoption products get when priced below threshold<br/>
                    • 1.0x = No boost | 1.3x = 30% more adoption | 1.5x = 50% more adoption<br/>
                    • <em>Use 1.3-1.4x for realistic scenarios</em><br/>
                    • <em>Use 1.5x if competing on price as main strategy</em><br/>
                    <br/>
                    <strong>High Price Penalty (multiplier):</strong><br/>
                    • How much adoption drops for products above threshold<br/>
                    • 1.0x = No penalty | 0.8x = 20% less adoption | 0.5x = 50% less adoption<br/>
                    • <em>Use 0.7-0.8x for premium products with strong brands</em><br/>
                    • <em>Use 0.5-0.6x for commodity products with many alternatives</em><br/>
                    <br/>
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      background: '#e3f2fd', 
                      borderRadius: '6px' 
                    }}>
                      <strong>Quick Presets Explained:</strong><br/>
                      <br/>
                      <strong>Low Sensitivity:</strong> Consumers less price-conscious<br/>
                      • Best for: Premium brand with loyal audience<br/>
                      • Settings: Threshold $15, Boost 1.1x, Penalty 0.9x<br/>
                      <br/>
                      <strong>Standard:</strong> Typical price elasticity<br/>
                      • Best for: Most realistic scenarios<br/>
                      • Settings: Threshold $12, Boost 1.3x, Penalty 0.8x<br/>
                      <br/>
                      <strong>High Sensitivity:</strong> Very price-conscious market<br/>
                      • Best for: Competitive market, price-sensitive audience<br/>
                      • Settings: Threshold $10, Boost 1.5x, Penalty 0.7x<br/>
                    </div>
                    <br/>
                    <div style={{ 
                      padding: '10px', 
                      background: '#ffebee', 
                      borderRadius: '6px',
                      border: '1px solid #ef5350'
                    }}>
                      <strong>⚠️ CNN-Specific Insights:</strong><br/>
                      • CNN+ launched at $5.99 → Got 0.15% take rate<br/>
                      • Testing shows All-Access needs to be under $10 to succeed<br/>
                      • Reader/Streaming can sustain $11-13 individually<br/>
                      • Standalone verticals work at $3-5<br/>
                      • <em>Recommendation: Use "High Sensitivity" with $10 threshold for CNN</em>
                    </div>
                  </div>'''

# Find where to insert this (after the price sensitivity checkbox section)
pattern = r'(</div>\s*\)}\s*</div>\s*\)\s*:\s*null}\s*</div>)'
if 'Enable Price Sensitivity Analysis' in content:
    # Add after the price sensitivity section
    content = re.sub(
        r'(</div>\s*\)\s*:\s*null}\s*</div>)',
        price_sensitivity_guide + r'\n\1',
        content,
        count=1
    )
else:
    # Add it at the end of the advanced settings section
    content = re.sub(
        r'(</div>\s*{\* Modal Actions \*})',
        price_sensitivity_guide + r'\n\1',
        content
    )

with open('src/components/MarketFactorsModal.tsx', 'w') as f:
    f.write(content)

print("✓ Added comprehensive Price Sensitivity guide")
