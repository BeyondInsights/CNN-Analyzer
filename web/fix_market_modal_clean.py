#!/usr/bin/env python3

with open('src/components/MarketFactorsModal.tsx', 'r') as f:
    content = f.read()

# Remove the duplicate/broken Price Sensitivity Guide sections
content = content.replace('''            <div className={styles.helpBox} style={{ marginTop: '1rem' }}>
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
            </div>''', '')

# Add helpful descriptions with each factor label
replacements = [
    ('Market Awareness <span className="text-gray-500">({settings.awareness}%)</span>',
     '''Market Awareness <span className="text-gray-500">({settings.awareness}%)</span>
                    <p className="text-xs text-gray-600 mt-1">% aware product exists. New: 20-40%, Established: 60-80%, Leader: 80-95%</p>'''),
    
    ('Distribution Reach <span className="text-gray-500">({settings.distribution}%)</span>',
     '''Distribution Reach <span className="text-gray-500">({settings.distribution}%)</span>
                    <p className="text-xs text-gray-600 mt-1">Payment/platform access. Basic: 70%, Good: 85%, Excellent: 95%</p>'''),
    
    ('Competitive Factor <span className="text-gray-500">({settings.competitive}%)</span>',
     '''Competitive Factor <span className="text-gray-500">({settings.competitive}%)</span>
                    <p className="text-xs text-gray-600 mt-1">vs. competitors. Weak: 50-70%, Parity: 70-85%, Strong: 85-100%</p>'''),
    
    ('Marketing Effectiveness <span className="text-gray-500">({settings.marketing}%)</span>',
     '''Marketing Effectiveness <span className="text-gray-500">({settings.marketing}%)</span>
                    <p className="text-xs text-gray-600 mt-1">Conversion rate. Poor: 40-60%, Average: 60-80%, Best: 80-95%</p>'''),
    
    ('Year One Adoption <span className="text-gray-500">({settings.yearOneAdoption}%)</span>',
     '''Year One Adoption <span className="text-gray-500">({settings.yearOneAdoption}%)</span>
                    <p className="text-xs text-gray-600 mt-1">Y1 adoption %. Conservative: 40-60%, Moderate: 60-75%, Aggressive: 75-90%</p>''')
]

for old, new in replacements:
    content = content.replace(old, new)

# Add a proper Price Sensitivity Guide section (once, in the right place)
price_guide = '''
              {settings.enablePriceSensitivity && (
                <div className="mt-3 space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2">📊 Quick Guide:</h4>
                    <p className="mb-2"><strong>Threshold:</strong> $10 (streaming), $12 (standard news), $15 (premium)</p>
                    <p className="mb-2"><strong>Low Price Boost:</strong> 1.3x = 30% boost, 1.5x = 50% boost</p>
                    <p><strong>High Price Penalty:</strong> 0.8x = 20% penalty, 0.7x = 30% penalty</p>
                  </div>'''

# Find where to insert the guide (after the Enable Tiered Price Sensitivity section)
if '{settings.enablePriceSensitivity && (' in content:
    # Replace the existing conditional block with our enhanced one
    import re
    pattern = r'(\{settings\.enablePriceSensitivity && \(\s*<div className="mt-3 space-y-3">)'
    replacement = price_guide + '\n'
    content = re.sub(pattern, replacement, content, count=1)

# Add scenario presets at the top of the modal
scenarios = '''
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Quick Scenarios:</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setSettings({...settings, awareness: 50, distribution: 60, competitive: 60, marketing: 50, yearOneAdoption: 50})}
                className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Conservative (50-60%)
              </button>
              <button
                onClick={() => setSettings({...settings, awareness: 70, distribution: 85, competitive: 75, marketing: 70, yearOneAdoption: 65})}
                className="text-xs px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
              >
                Realistic (65-85%)
              </button>
              <button
                onClick={() => setSettings({...settings, awareness: 85, distribution: 90, competitive: 85, marketing: 85, yearOneAdoption: 80})}
                className="text-xs px-2 py-1 bg-green-200 rounded hover:bg-green-300"
              >
                Optimistic (80-90%)
              </button>
            </div>
          </div>
'''

# Add scenarios after the title
content = content.replace(
    '<div className="space-y-4">',
    '<div className="space-y-4">\n' + scenarios
)

with open('src/components/MarketFactorsModal.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed MarketFactorsModal with proper descriptions and guides")
