#!/usr/bin/env python3
import re

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Find the takeRates mapping and ensure it preserves order
fix = '''  // Step 2: Calculate overall take rates - PRESERVE INPUT ORDER
  const takeRates: TakeRate[] = products.map((prod, prodIndex) => {
    console.log(`Processing product ${prodIndex}: ${prod.product}`);'''

content = re.sub(
    r'// Step 2: Calculate overall take rates\s*\n\s*const takeRates: TakeRate\[\] = products\.map\(\(prod, prodIndex\) => \{',
    fix,
    content
)

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Added order preservation in calculations")
