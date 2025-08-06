#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add a comprehensive help section right after the Market Factors modal opens
help_section = '''
            {/* Comprehensive Help Guide */}
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              background: '#f0f8ff', 
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#1976d2' }}>📚 Quick Reference Guide</h4>
              
              <strong>Market Awareness:</strong> % of target audience who know your product exists
              <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                <li>20-40%: New launch, no brand recognition</li>
                <li>60-80%: Established brand (use for CNN)</li>
                <li>80-95%: Market leader with high visibility</li>
              </ul>
              
              <strong>Distribution Reach:</strong> How easily customers can purchase/access
              <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                <li>70%: Limited payment methods, some technical barriers</li>
                <li>85%: Good coverage, most platforms (use for CNN)</li>
                <li>95%: Everywhere, all devices, all payment types</li>
              </ul>
              
              <strong>Competitive Position:</strong> Your strength vs. alternatives
              <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                <li>50-70%: Many strong competitors (Netflix, NYT, WSJ)</li>
                <li>70-85%: Competitive parity (realistic for CNN)</li>
                <li>85-100%: Clear differentiation, unique value</li>
              </ul>
              
              <strong>Marketing Effectiveness:</strong> How well campaigns convert to sales
              <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                <li>40-60%: Basic marketing, low conversion</li>
                <li>60-80%: Professional campaigns (use for CNN)</li>
                <li>80-95%: Best-in-class targeting & creative</li>
              </ul>
              
              <strong>Year One Adoption:</strong> % of eventual subscribers who join in Y1
              <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                <li>40-60%: Slow build, word-of-mouth growth</li>
                <li>60-75%: Typical launch curve (use for CNN)</li>
                <li>75-90%: Aggressive promotion, viral growth</li>
              </ul>
              
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem', 
                background: '#fff3cd', 
                borderRadius: '6px',
                border: '1px solid #ffc107'
              }}>
                <strong>💡 CNN Recommended Settings:</strong><br/>
                Awareness: 70%, Distribution: 85%, Competitive: 75%, Marketing: 70%, Year One: 65%<br/>
                <em>These reflect CNN's strong brand but competitive market position</em>
              </div>
            </div>'''

# Insert after the Market Factors Configuration title
pattern = r'(Adjust market realization factors to fine-tune your forecast\s*</p>)'
content = re.sub(pattern, r'\1\n' + help_section, content)

# Add Price Sensitivity detailed guide
price_sensitivity_guide = '''
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: '#e8f5e9', 
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}>
                    <h4 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>📊 Price Sensitivity Settings Explained</h4>
                    
                    <strong>Price Threshold ($):</strong> The psychological "expensive" barrier
                    <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                      <li>$10: Entertainment benchmark (Netflix, Spotify)</li>
                      <li>$12: Standard news threshold (recommended for CNN)</li>
                      <li>$15: Premium news (NYT, WSJ, FT level)</li>
                    </ul>
                    
                    <strong>Low Price Boost:</strong> Extra adoption when below threshold
                    <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                      <li>1.1x = 10% boost (price-insensitive market)</li>
                      <li>1.3x = 30% boost (standard elasticity)</li>
                      <li>1.5x = 50% boost (very price-sensitive)</li>
                    </ul>
                    
                    <strong>High Price Penalty:</strong> Lost adoption above threshold
                    <ul style={{ margin: '0.25rem 0 0.5rem 1.5rem' }}>
                      <li>0.9x = 10% penalty (strong brand loyalty)</li>
                      <li>0.8x = 20% penalty (standard)</li>
                      <li>0.7x = 30% penalty (price-sensitive market)</li>
                    </ul>
                    
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      background: '#c8e6c9', 
                      borderRadius: '4px'
                    }}>
                      <strong>Presets Explained:</strong><br/>
                      • <strong>Low:</strong> Premium positioning, less price impact<br/>
                      • <strong>Standard:</strong> Typical market response (recommended)<br/>
                      • <strong>High:</strong> Budget-conscious audience, strong price impact
                    </div>
                  </div>'''

# Add after the Price Sensitivity checkbox
pattern = r'(</label>\s*{priceSensitivityEnabled && \()'
content = re.sub(pattern, r'</label>\n' + price_sensitivity_guide + r'\n\1', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added comprehensive documentation for all Market Factors and Price Sensitivity settings")
