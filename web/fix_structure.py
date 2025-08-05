#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the downloadReport closing and ensure proper structure
for i in range(len(lines)):
    if i < len(lines) - 1:
        # If we find the downloadReport closing, ensure proper spacing
        if '  };' in lines[i] and 'downloadReport' in ''.join(lines[max(0, i-5):i]):
            # Check if next line is the authentication check
            if '// ============ AUTHENTICATION' in lines[i+1]:
                print(f"Found issue at line {i+1}: downloadReport closes directly before auth check")
                print("This is correct structure - the issue must be elsewhere")
            break

# The real issue: we're inside Page function but at brace level 2
# This means one of the earlier functions isn't closed properly
# Let's check each function's closing
functions = [
    'handlePasswordAuthenticated',
    'getPricingForProductType', 
    'toggleProduct',
    'toggleCardExpansion',
    'openFeatureModal',
    'updateCardProductType',
    'updateCardFeatures',
    'updateCardPricing',
    'clearAllCards',
    'handleRunSimulationClick',
    'handleSimulation',
    'getProductDescription',
    'getTargetAudience',
    'getKeyFeatures',
    'handleShowProfiles',
    'handleSensitivityAnalysis',
    'handleVerticalChange',
    'downloadReport'
]

for func in functions:
    found_start = False
    brace_count = 0
    start_line = 0
    
    for i, line in enumerate(lines):
        if f'const {func} = ' in line and '{' in line:
            found_start = True
            start_line = i
            brace_count = 1
        elif found_start:
            brace_count += line.count('{') - line.count('}')
            if brace_count == 0:
                print(f"✓ {func}: starts at {start_line+1}, closes at {i+1}")
                found_start = False
                break
    
    if found_start:
        print(f"✗ {func}: starts at {start_line+1}, UNCLOSED at line 823!")
