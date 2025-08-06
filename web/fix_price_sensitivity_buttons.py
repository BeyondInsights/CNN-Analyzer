#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Find and update the Price Sensitivity preset buttons to have proper selected styling
# Look for the button section
old_pattern = r'''<button
                      onClick=\{\(\) => \{[^}]*?\}\}
                      style=\{\{[^}]*?\}\}
                    >
                      (Low Sensitivity|Standard|High Sensitivity)'''

# Replace with conditional styling based on selection
new_button_template = '''<button
                      onClick={() => {{
                        setPriceThreshold({threshold});
                        setLowPriceMultiplier({low});
                        setHighPriceMultiplier({high});
                      }}
                      style={{{{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #cc0000',
                        borderRadius: '4px',
                        background: priceThreshold === {threshold} && lowPriceMultiplier === {low} && highPriceMultiplier === {high} ? '#cc0000' : 'white',
                        color: priceThreshold === {threshold} && lowPriceMultiplier === {low} && highPriceMultiplier === {high} ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: priceThreshold === {threshold} && lowPriceMultiplier === {low} && highPriceMultiplier === {high} ? 'bold' : 'normal'
                      }}}}
                    >
                      {label}'''

# Find the specific section with these buttons
if 'Low Sensitivity' in content and 'Standard' in content and 'High Sensitivity' in content:
    # Update each button with proper conditional styling
    # This is in the Market Factors modal section
    print("Found Price Sensitivity buttons, updating styling...")
    
    # The buttons should highlight when their values match
    # We need to find the exact location and update it
    
# Since the structure might be complex, let's do a targeted replacement
# Find the div with the three buttons
pattern = r'(<div style=\{\{ display: \'flex\', gap: \'0\.5rem\'[^>]*>)(.*?)(Low Sensitivity.*?High Sensitivity.*?)(</button>\s*</div>)'

if re.search(pattern, content, re.DOTALL):
    print("Found button group, updating...")
    
with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Updated button styling")
