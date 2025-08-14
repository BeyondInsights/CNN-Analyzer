#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add a simple div that shows when showDemographicProfiles is true
# This will test if the issue is with the component or with React rendering
simple_modal = '''
      {/* Simple Test Modal */}
      {showDemographicProfiles && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '40px',
          border: '2px solid red',
          zIndex: 99999,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <h2>Demographics Modal Test</h2>
          <p>If you can see this, React rendering works!</p>
          <p>State value: {showDemographicProfiles ? 'TRUE' : 'FALSE'}</p>
          <button onClick={() => setShowDemographicProfiles(false)}>Close Test</button>
        </div>
      )}'''

# Find where to insert (before the last </div>)
lines = content.split('\n')
for i in range(len(lines) - 1, 0, -1):
    if '</div>' in lines[i] and '/* Main container' not in lines[i-1]:
        lines.insert(i, simple_modal)
        print(f"✓ Added simple test modal at line {i}")
        break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)

print("✓ Simple modal added - this MUST work if React is working")
