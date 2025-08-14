#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Add the state if missing
state_found = False
for i, line in enumerate(lines):
    if 'showDemographicProfiles' in line and 'useState' in line:
        state_found = True
        break

if not state_found:
    # Add after another useState line
    for i, line in enumerate(lines):
        if 'const [showAttributeImpact' in line:
            lines.insert(i + 1, '  const [showDemographicProfiles, setShowDemographicProfiles] = useState(false);\n')
            print("✓ Added state")
            break

# Add the button after Run Simulation
button_added = False
for i, line in enumerate(lines):
    if "'Run Simulation'" in line or '"Run Simulation"' in line:
        # Find the closing </button>
        j = i
        while j < len(lines) and '</button>' not in lines[j]:
            j += 1
        if j < len(lines):
            button_code = '''
          <button
            className={styles.headerButton}
            onClick={() => {
              console.log("Demographics button clicked");
              alert("Demographic profiles feature is being integrated. Check back soon!");
            }}
          >
            <span className={styles.iconSpacing}>👥</span> View Demographics
          </button>
'''
            lines.insert(j + 1, button_code)
            button_added = True
            print(f"✓ Added button after line {j+1}")
            break

with open('src/app/page.tsx', 'w') as f:
    f.writelines(lines)

if button_added:
    print("✅ Button added successfully")
else:
    print("⚠️ Could not add button")
