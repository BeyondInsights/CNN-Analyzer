import re

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Check if calibration exists
if 'MODEL_CALIBRATION_FACTOR' not in content:
    # Add after imports
    lines = content.split('\n')
    import_end = 0
    for i, line in enumerate(lines):
        if line.strip() and not line.startswith('import') and import_end == 0:
            import_end = i
            break
    
    calibration = '''
const MODEL_CALIBRATION_FACTOR = 3.0;

const PRODUCT_CALIBRATION: Record<string, number> = {
  'CNN Reader': 0.95,
  'CNN All-Access': 1.05,
  'CNN Streaming': 0.90,
  'CNN Standalone Vertical': 0.30
};
'''
    lines.insert(import_end, calibration)
    
    with open('src/lib/calculations.ts', 'w') as f:
        f.write('\n'.join(lines))
    print("✓ Added calibration factors")
else:
    print("✓ Calibration factors already present")
