#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add Price Sensitivity documentation AFTER the checkbox
price_docs = '''
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: '#f0f8ff', 
                    borderRadius: '8px',
                    border: '1px solid #2196f3',
                    fontSize: '13px'
                  }}>
                    <h4 style={{ color: '#1976d2', marginBottom: '0.5rem' }}>📊 Price Sensitivity Guide</h4>
                    
                    <strong>What This Does:</strong> Adjusts how dramatically price affects adoption rates<br/><br/>
                    
                    <strong>Price Threshold ($):</strong> The "sticker shock" point<br/>
                    • $10 = Entertainment benchmark (Netflix/Spotify)<br/>
                    • $12 = Standard news (recommended for CNN)<br/>
                    • $15 = Premium news (NYT/WSJ level)<br/><br/>
                    
                    <strong>Low Price Boost:</strong> Extra adoption when below threshold<br/>
                    • 1.1x = 10% more (price doesn't matter much)<br/>
                    • 1.3x = 30% more (standard response)<br/>
                    • 1.5x = 50% more (very price-sensitive)<br/><br/>
                    
                    <strong>High Price Penalty:</strong> Lost adoption above threshold<br/>
                    • 0.9x = 10% less (loyal audience)<br/>
                    • 0.8x = 20% less (standard penalty)<br/>
                    • 0.7x = 30% less (price-sensitive market)<br/><br/>
                    
                    <div style={{ 
                      padding: '0.5rem', 
                      background: '#e3f2fd', 
                      borderRadius: '4px',
                      marginTop: '0.5rem'
                    }}>
                      <strong>Presets:</strong><br/>
                      • <strong>Low:</strong> Premium brand, less price impact ($15, 1.1x, 0.9x)<br/>
                      • <strong>Standard:</strong> Typical market ($12, 1.3x, 0.8x) - RECOMMENDED<br/>
                      • <strong>High:</strong> Budget-conscious ($10, 1.5x, 0.7x)
                    </div>
                  </div>'''

# Find where to insert (after the example impact div)
pattern = r'(\* Products above \$\d+: Up to.*?adoption reduction\s*</div>\s*</div>)'
if re.search(pattern, content):
    content = re.sub(pattern, r'\1\n' + price_docs, content)
    print("✓ Added Price Sensitivity documentation")

# 2. Fix the button styling to show selected state properly
# Find the buttons section
button_section_start = content.find('<div style={{ display: \'flex\', gap: \'0.5rem\', marginBottom: \'1.5rem\' }}>')
if button_section_start > 0:
    # Extract the button section
    button_section_end = content.find('</div>', button_section_start) + 6
    button_section = content[button_section_start:button_section_end]
    
    # Replace each button with proper conditional styling
    new_buttons = '''<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => {
                        setPriceThreshold(10);
                        setLowPriceMultiplier(1.1);
                        setHighPriceMultiplier(0.9);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #cc0000',
                        borderRadius: '4px',
                        background: (priceThreshold === 10 && lowPriceMultiplier === 1.1 && highPriceMultiplier === 0.9) ? '#cc0000' : 'white',
                        color: (priceThreshold === 10 && lowPriceMultiplier === 1.1 && highPriceMultiplier === 0.9) ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: (priceThreshold === 10 && lowPriceMultiplier === 1.1 && highPriceMultiplier === 0.9) ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      Low Sensitivity
                    </button>
                    
                    <button
                      onClick={() => {
                        setPriceThreshold(12);
                        setLowPriceMultiplier(1.3);
                        setHighPriceMultiplier(0.8);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #cc0000',
                        borderRadius: '4px',
                        background: (priceThreshold === 12 && lowPriceMultiplier === 1.3 && highPriceMultiplier === 0.8) ? '#cc0000' : 'white',
                        color: (priceThreshold === 12 && lowPriceMultiplier === 1.3 && highPriceMultiplier === 0.8) ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: (priceThreshold === 12 && lowPriceMultiplier === 1.3 && highPriceMultiplier === 0.8) ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      Standard
                    </button>
                    
                    <button
                      onClick={() => {
                        setPriceThreshold(15);
                        setLowPriceMultiplier(1.5);
                        setHighPriceMultiplier(0.7);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #cc0000',
                        borderRadius: '4px',
                        background: (priceThreshold === 15 && lowPriceMultiplier === 1.5 && highPriceMultiplier === 0.7) ? '#cc0000' : 'white',
                        color: (priceThreshold === 15 && lowPriceMultiplier === 1.5 && highPriceMultiplier === 0.7) ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: (priceThreshold === 15 && lowPriceMultiplier === 1.5 && highPriceMultiplier === 0.7) ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      High Sensitivity
                    </button>
                  </div>'''
    
    content = content[:button_section_start] + new_buttons + content[button_section_end:]
    print("✓ Fixed button styling with red background for selected state")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
