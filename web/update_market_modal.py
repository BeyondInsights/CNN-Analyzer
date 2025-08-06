#!/usr/bin/env python3
import re

with open('src/components/MarketFactorsModal.tsx', 'r') as f:
    content = f.read()

# Check if the old descriptions exist and replace them
replacements = [
    ("How well your target market knows about your product", 
     "% of target audience aware product exists. New launch: 20-40%, Established: 60-80%, Leader: 80-95%"),
    
    ("How easily customers can access your product",
     "Ability to purchase/access. Payment methods: 70-90%, Tech requirements: 80-95%, Geographic: 85-100%"),
    
    ("Your advantage compared to alternatives",
     "Strength vs. competitors. Weak: 50-70%, Parity: 70-85%, Strong advantage: 85-100%"),
    
    ("How well your marketing converts to customers",
     "Marketing conversion rate. Poor: 40-60%, Average: 60-80%, Best-in-class: 80-95%"),
    
    ("Expected adoption speed in the first year",
     "Year 1 adoption %. Conservative: 40-60%, Moderate: 60-75%, Aggressive: 75-90%")
]

changes_made = 0
for old_text, new_text in replacements:
    if old_text in content:
        content = content.replace(old_text, new_text)
        changes_made += 1
        print(f"✓ Replaced: {old_text[:30]}...")

# Add Price Sensitivity guide if not already there
if "Price Sensitivity Settings Guide" not in content:
    # Find where to add it - after the price sensitivity section
    pattern = r'(highPriceMultiplier.*?</div>.*?</div>)'
    if re.search(pattern, content, re.DOTALL):
        price_guide = '''
            <div className={styles.helpBox} style={{ marginTop: '1rem' }}>
              <h4>�� Price Sensitivity Guide</h4>
              <p><strong>Price Threshold:</strong> The psychological barrier. Below = value, Above = expensive</p>
              <ul>
                <li>$10 - Digital subscription benchmark (Netflix/Spotify)</li>
                <li>$12 - Standard news (recommended)</li>
                <li>$15 - Premium news (NYT/WSJ)</li>
              </ul>
              <p><strong>Low Price Boost:</strong> Extra adoption when below threshold</p>
              <ul>
                <li>1.3x = 30% boost (standard)</li>
                <li>1.5x = 50% boost (aggressive)</li>
              </ul>
              <p><strong>High Price Penalty:</strong> Reduced adoption when above threshold</p>
              <ul>
                <li>0.8x = 20% penalty (mild)</li>
                <li>0.7x = 30% penalty (standard)</li>
                <li>0.5x = 50% penalty (severe)</li>
              </ul>
            </div>'''
        
        content = re.sub(pattern, r'\1' + price_guide, content, flags=re.DOTALL)
        print("✓ Added Price Sensitivity guide")
        changes_made += 1

print(f"\nTotal changes made: {changes_made}")

with open('src/components/MarketFactorsModal.tsx', 'w') as f:
    f.write(content)
