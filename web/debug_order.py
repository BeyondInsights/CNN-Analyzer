#!/usr/bin/env python3
import re

# Add comprehensive logging to trace product order

# 1. In page.tsx - log what's being sent
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add logging right before runSecureSimulation call
log_before_send = '''      console.log('[PAGE] Sending products in order:', activeConfigured.map((p, i) => `${i}: ${p.product} @ $${p.monthlyRate}`));
      '''

content = re.sub(
    r'(const result = await runSecureSimulation\()',
    log_before_send + r'\1',
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

# 2. In httpSimulation.ts - log what's being sent to API
with open('src/lib/httpSimulation.ts', 'r') as f:
    content = f.read()

log_in_http = '''  console.log('[HTTP] Sending to API:', products.map((p, i) => `${i}: ${p.product}`));
  '''

content = re.sub(
    r'(const response = await fetch)',
    log_in_http + r'\1',
    content
)

with open('src/lib/httpSimulation.ts', 'w') as f:
    f.write(content)

# 3. In calculations.ts - log what order products are processed
with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

log_in_calc = '''  console.log('[CALC] Processing products:', products.map((p, i) => `${i}: ${p.product}`));
  '''

# Add at the start of performSimulation
content = re.sub(
    r'(export function performSimulation\([^{]*\{)',
    r'\1\n' + log_in_calc,
    content
)

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Added comprehensive order tracking")
