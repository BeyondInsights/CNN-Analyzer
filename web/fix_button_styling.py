#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix the three price sensitivity buttons to show selected state
# Find and update each button's background style
updates = [
    # Low Sensitivity - when threshold=10, low=1.1, high=0.9
    (r"background: priceThreshold === 10 \? '#f0f0f0' : 'white'",
     "background: priceThreshold === 10 && lowPriceMultiplier === 1.1 && highPriceMultiplier === 0.9 ? '#cc0000' : 'white'"),
    
    # Standard - when threshold=12, low=1.3, high=0.8  
    (r"background: priceThreshold === 12 \? '#f0f0f0' : 'white'",
     "background: priceThreshold === 12 && lowPriceMultiplier === 1.3 && highPriceMultiplier === 0.8 ? '#cc0000' : 'white'"),
    
    # High Sensitivity - already has special styling
    (r"background: priceThreshold === 15 \? '#cc0000' : 'white'",
     "background: priceThreshold === 15 && lowPriceMultiplier === 1.5 && highPriceMultiplier === 0.7 ? '#cc0000' : 'white'")
]

for old, new in updates:
    if old in content:
        content = content.replace(old, new)
        print(f"✓ Updated button styling")

# Also update text color to be white when selected
content = re.sub(
    r"color: priceThreshold === (\d+) \? 'white' : '#333'",
    lambda m: f"color: priceThreshold === {m.group(1)} && lowPriceMultiplier === {1.1 if m.group(1)=='10' else 1.3 if m.group(1)=='12' else 1.5} && highPriceMultiplier === {0.9 if m.group(1)=='10' else 0.8 if m.group(1)=='12' else 0.7} ? 'white' : '#333'",
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Fixed Price Sensitivity button styling")
