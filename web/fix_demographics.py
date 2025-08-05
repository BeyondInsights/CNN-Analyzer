#!/usr/bin/env python3
import re

with open('src/lib/calculations.ts', 'r') as f:
    content = f.read()

# Replace the demographic multipliers with more realistic ones
new_multipliers = '''// DEFAULT DEMOGRAPHIC MULTIPLIERS (can be overridden by UI)
const DEFAULT_DEMO_MULTIPLIERS: DemoMultipliers = {
  gender: {
    'Male': 1.0,
    'Female': 1.05,  // Slightly higher engagement with subscription content
  },
  age: {
    '18-34': 0.85,    // More price sensitive, less likely to pay
    '35-54': 1.15,    // Sweet spot - disposable income + digital comfort
    '55-74': 0.90     // Prefer linear TV, harder sell for digital
  },
  cnnAccess: {
    'Regularly Access CNN': 0.95,     // Harder to convert free users
    'Occasionally Access CNN': 1.10,   // More convertible - seeking more content
    'Rarely Access CNN': 0.85         // Low brand affinity
  },
  linearTV: {
    'Have Linear TV': 0.85,   // Already getting CNN through cable
    'No Linear TV': 1.20      // Digital-first, more likely to subscribe
  },
  digitalNews: {
    'Digital News Subscriber': 1.15,  // Already paying for news
    'Non-Subscriber': 0.95           // Haven't shown willingness to pay
  }
};'''

# Replace the existing multipliers
content = re.sub(
    r'// DEFAULT DEMOGRAPHIC MULTIPLIERS.*?const DEFAULT_DEMO_MULTIPLIERS.*?\n\};',
    new_multipliers,
    content,
    flags=re.DOTALL
)

# Also ensure standalone verticals stay conservative
content = re.sub(
    r"'CNN Standalone Vertical': 0.30",
    "'CNN Standalone Vertical': 0.20",  # Even more conservative
    content
)

with open('src/lib/calculations.ts', 'w') as f:
    f.write(content)

print("✓ Updated demographic multipliers to reflect CNN audience realities")
