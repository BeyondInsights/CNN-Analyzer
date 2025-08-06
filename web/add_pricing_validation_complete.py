#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add the validation logic
validation_code = '''
      // Validate pricing logic before simulation
      const validatePricing = () => {
        const products = Array.from(activeProductsState)
          .filter(id => cardDataState[id] && cardDataState[id].product)
          .map(id => cardDataState[id]);
        
        const readerPrice = products.find(p => p.product === 'CNN Reader')?.monthlyRate;
        const streamingPrice = products.find(p => p.product === 'CNN Streaming')?.monthlyRate;
        const allAccessPrice = products.find(p => p.product === 'CNN All-Access')?.monthlyRate;
        
        let warnings = [];
        
        // Check if All-Access is priced below components
        if (allAccessPrice && readerPrice && allAccessPrice < readerPrice) {
          warnings.push('• All-Access ($' + allAccessPrice.toFixed(2) + ') is priced below Reader ($' + readerPrice.toFixed(2) + ')');
        }
        if (allAccessPrice && streamingPrice && allAccessPrice < streamingPrice) {
          warnings.push('• All-Access ($' + allAccessPrice.toFixed(2) + ') is priced below Streaming ($' + streamingPrice.toFixed(2) + ')');
        }
        
        // Check if bundle discount is too steep
        if (allAccessPrice && readerPrice && streamingPrice) {
          const combinedPrice = readerPrice + streamingPrice;
          const discount = ((combinedPrice - allAccessPrice) / combinedPrice) * 100;
          if (discount > 50) {
            warnings.push('• Bundle discount is ' + discount.toFixed(0) + '% (typically 20-30%)');
          }
        }
        
        // Check if All-Access exists without components
        if (allAccessPrice && !readerPrice && !streamingPrice) {
          warnings.push('• All-Access bundle exists without individual Reader or Streaming products');
        }
        
        if (warnings.length > 0) {
          const message = 'Pricing Structure Warning:\\n\\n' + 
                         warnings.join('\\n') + 
                         '\\n\\nThis pricing structure is uncommon and may not reflect real market behavior.\\n\\n' +
                         'Continue anyway?';
          return confirm(message);
        }
        return true;
      };
      
      // Check pricing before running simulation
      if (!validatePricing()) {
        setIsSimulating(false);
        return;
      }
'''

# Insert the validation before setIsSimulating(true)
pattern = r'(setIsSimulating\(true\);)'
content = re.sub(pattern, validation_code + r'\n      \1', content, count=1)

# 2. Add Pricing Best Practices button and modal
best_practices_button = '''
          <button
            className={styles.headerButton}
            onClick={() => setShowPricingGuide(true)}
            disabled={isSimulating}
          >
            <span className={styles.iconSpacing}>💡</span> Pricing Best Practices
          </button>'''

# Add button after the About Model button
pattern = r'(About the Model\s*</button>)'
content = re.sub(pattern, r'\1' + best_practices_button, content, count=1)

# Add state for the modal
state_addition = '''
  const [showPricingGuide, setShowPricingGuide] = useState(false);'''

# Add after other state declarations
pattern = r'(const \[showAttributeImpact, setShowAttributeImpact\] = useState\(false\);)'
content = re.sub(pattern, r'\1' + state_addition, content, count=1)

# 3. Add the Pricing Guide modal
pricing_guide_modal = '''
      {/* Pricing Best Practices Modal */}
      {showPricingGuide && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalMedium}`}>
            <div className={styles.modalHeader}>
              <h2>Pricing Best Practices Guide</h2>
              <button className={styles.closeModal} onClick={() => setShowPricingGuide(false)}>×</button>
            </div>
            <div className={styles.modalContent} style={{ padding: '20px' }}>
              <div style={{ 
                padding: '1rem', 
                background: '#e3f2fd', 
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#1976d2', marginBottom: '1rem' }}>Recommended Pricing Ranges</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Individual Products (Monthly):</strong>
                  <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                    <li><strong>CNN Reader:</strong> $8-12</li>
                    <li><strong>CNN Streaming:</strong> $10-14</li>
                    <li><strong>CNN Standalone Vertical:</strong> $3-5</li>
                  </ul>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Bundle Pricing (All-Access):</strong>
                  <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                    <li>Should be 70-80% of Reader + Streaming combined</li>
                    <li>Must be MORE than highest individual product</li>
                    <li>Example: Reader $10 + Streaming $12 = $22 → All-Access at $15-17</li>
                  </ul>
                </div>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: '#fff3cd', 
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ color: '#856404', marginBottom: '1rem' }}>⚠️ Common Pricing Mistakes to Avoid</h3>
                <ol style={{ margin: '0.5rem 0 0 1.5rem' }}>
                  <li><strong>Inverted Bundle:</strong> Never price All-Access below individual products</li>
                  <li><strong>Excessive Discount:</strong> Bundle discounts over 40% seem unrealistic</li>
                  <li><strong>Inconsistent Tiers:</strong> Maintain logical progression (Reader < Streaming < All-Access)</li>
                  <li><strong>Anchor Confusion:</strong> Don't make individual products so expensive they're just decoys</li>
                </ol>
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: '#f0f0f0', 
                borderRadius: '8px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>�� Strategic Tips</h3>
                <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                  <li><strong>Test incrementally:</strong> Try $1 changes to find optimal price points</li>
                  <li><strong>Consider cannibalization:</strong> All-Access should enhance, not destroy, individual product value</li>
                  <li><strong>Annual pricing:</strong> 10-20% discount for annual commitment is standard</li>
                  <li><strong>Market position:</strong> CNN should price between mass market ($5-10) and premium ($15-25)</li>
                </ul>
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button 
                className={styles.btnPrimary}
                onClick={() => setShowPricingGuide(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}'''

# Add modal before the closing </div> of the page
pattern = r'(</div>\s*\);\s*}\s*$)'
content = re.sub(pattern, pricing_guide_modal + r'\n\1', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added pricing validation warnings")
print("✓ Added Pricing Best Practices button and guide")
print("✓ Ready to build and test")
