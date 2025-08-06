#!/usr/bin/env python3

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add just the validation function INSIDE handleSimulation
validation_code = '''
      // Simple pricing validation
      const products = Array.from(activeProductsState)
        .filter(id => cardDataState[id] && cardDataState[id].product)
        .map(id => cardDataState[id]);
      
      const readerPrice = products.find(p => p.product === 'CNN Reader')?.monthlyRate || 999;
      const streamingPrice = products.find(p => p.product === 'CNN Streaming')?.monthlyRate || 999;
      const allAccessPrice = products.find(p => p.product === 'CNN All-Access')?.monthlyRate || 0;
      
      if (allAccessPrice > 0 && allAccessPrice < Math.min(readerPrice, streamingPrice)) {
        if (!confirm('Warning: All-Access is priced below individual products. This is unrealistic. Continue anyway?')) {
          setIsSimulating(false);
          return;
        }
      }
'''

# Find handleSimulation and add validation after setIsSimulating(true)
import re
pattern = r'(setIsSimulating\(true\);\s*try \{)'
replacement = r'setIsSimulating(true);\n' + validation_code + r'\n    try {'

content = re.sub(pattern, replacement, content, count=1)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added simple validation")
