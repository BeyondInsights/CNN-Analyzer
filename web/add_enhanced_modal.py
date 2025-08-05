#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add state for the modal (find other useState declarations)
state_line = "  const [showHowToModal, setShowHowToModal] = useState(false);\n"
pattern = r'(const \[isSimulating, setIsSimulating\] = useState\(false\);)'
content = re.sub(pattern, r'\1\n' + state_line, content)

# 2. Update the How to Use button to use the modal
old_button = r'onClick=\{\(\) => \{[\s\S]*?alert\(message\);[\s\S]*?\}\}'
new_button = 'onClick={() => setShowHowToModal(true)}'
content = re.sub(old_button, new_button, content)

# 3. Add the beautiful modal component before the final closing tags
modal = '''
      {/* Enhanced How to Use Modal */}
      {showHowToModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              borderRadius: '12px 12px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowHowToModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '28px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              <h2 style={{ color: 'white', fontSize: '28px', margin: 0, textAlign: 'center' }}>
                📖 HOW TO USE THE CNN SUBSCRIPTION SIMULATOR
              </h2>
            </div>
            
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#667eea', fontSize: '22px', marginBottom: '20px', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
                  Quick Start Guide
                </h3>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                    <h4 style={{ color: '#333', marginBottom: '10px' }}>1. Select Active Products</h4>
                    <p style={{ margin: '5px 0' }}>• Click numbered buttons (Product 1-8) to include/exclude</p>
                    <p style={{ margin: '5px 0', color: '#666' }}>• <span style={{ color: '#28a745', fontWeight: 'bold' }}>Green</span> = included | <span style={{ color: '#6c757d', fontWeight: 'bold' }}>Gray</span> = excluded</p>
                  </div>
                  
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #764ba2' }}>
                    <h4 style={{ color: '#333', marginBottom: '10px' }}>2. Configure Each Product</h4>
                    <p style={{ margin: '5px 0' }}><strong>Choose Base Type:</strong> CNN Reader, Streaming, All-Access, or Standalone</p>
                    <p style={{ margin: '5px 0' }}><strong>Add Features:</strong> Click "+ Add" for reader/streaming features</p>
                    <p style={{ margin: '5px 0' }}><strong>Set Pricing:</strong> Use slider and select terms</p>
                  </div>
                  
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                    <h4 style={{ color: '#333', marginBottom: '10px' }}>3. Run the Simulation</h4>
                    <p style={{ margin: '5px 0' }}>• Click the green <strong>"Run Simulation"</strong> button</p>
                    <p style={{ margin: '5px 0', color: '#666' }}>• Results appear instantly</p>
                  </div>
                  
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                    <h4 style={{ color: '#333', marginBottom: '10px' }}>4. Read the Results</h4>
                    <p style={{ margin: '5px 0' }}><strong>Take Rates:</strong> % of 105M households subscribing</p>
                    <p style={{ margin: '5px 0' }}><strong>Revenue:</strong> Annual revenue projections</p>
                    <p style={{ margin: '5px 0' }}><strong>Segments:</strong> Demographics breakdown</p>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#667eea', fontSize: '22px', marginBottom: '20px', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
                  Button Guide
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '6px' }}>
                    <strong style={{ color: '#1976d2' }}>📊 Set Report Type</strong>
                    <p style={{ fontSize: '14px', marginTop: '5px' }}>Tiered vs Independent products</p>
                  </div>
                  <div style={{ padding: '15px', background: '#fce4ec', borderRadius: '6px' }}>
                    <strong style={{ color: '#c2185b' }}>⚙️ Market Factors</strong>
                    <p style={{ fontSize: '14px', marginTop: '5px' }}>Adjust real-world constraints</p>
                  </div>
                  <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '6px' }}>
                    <strong style={{ color: '#388e3c' }}>📈 Price Sensitivity</strong>
                    <p style={{ fontSize: '14px', marginTop: '5px' }}>See price impact on adoption</p>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button
                  onClick={() => setShowHowToModal(false)}
                  style={{
                    padding: '12px 30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Got it! Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
'''

# Add modal before the last closing </div>
pattern = r'(</div>\s*\);\s*}\s*$)'
content = re.sub(pattern, modal + r'\n\1', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added enhanced How to Use modal")
