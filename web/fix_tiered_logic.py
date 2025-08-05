#!/usr/bin/env python3
import re

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Add smarter calibration that considers relative pricing
new_calibration = '''const PRODUCT_CALIBRATION: Record<string, number> = {
  'CNN Reader': 0.95,
  'CNN All-Access': 1.05,
  'CNN Streaming': 0.90,
  'CNN Standalone Vertical': 0.30
};

// Dynamic calibration for tiered bundles based on relative pricing
function getDynamicCalibration(product: string, products: any[], reportType: string): number {
  const baseCalib = PRODUCT_CALIBRATION[product] || 1.0;
  
  if (reportType !== 'tiered' && reportType !== 'bundle') {
    return baseCalib;
  }
  
  // Find All-Access and individual product prices
  const allAccess = products.find(p => p.product === 'CNN All-Access');
  const reader = products.find(p => p.product === 'CNN Reader');
  const streaming = products.find(p => p.product === 'CNN Streaming');
  
  if (allAccess) {
    // If All-Access is cheaper than both individuals, boost it significantly
    if (reader && allAccess.monthlyRate < reader.monthlyRate * 0.8) {
      if (product === 'CNN All-Access') return baseCalib * 1.5;
      if (product === 'CNN Reader') return baseCalib * 0.5;
    }
    if (streaming && allAccess.monthlyRate < streaming.monthlyRate * 0.8) {
      if (product === 'CNN All-Access') return baseCalib * 1.5;
      if (product === 'CNN Streaming') return baseCalib * 0.5;
    }
  }
  
  return baseCalib;
}'''

# Replace the calibration section
content = re.sub(
    r'const PRODUCT_CALIBRATION: Record<string, number> = \{[^}]*\};',
    new_calibration,
    content
)

# Update usage to use dynamic calibration
content = re.sub(
    r'let productCalibration = PRODUCT_CALIBRATION\[prod\.product\];',
    'let productCalibration = getDynamicCalibration(prod.product, products, reportType);',
    content
)

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Added dynamic calibration for tiered pricing")
