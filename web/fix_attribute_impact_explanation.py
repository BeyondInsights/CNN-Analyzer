#!/usr/bin/env python3

# Check if it's in AttributeImpactModal.tsx
with open('src/components/AttributeImpactModal.tsx', 'r') as f:
    content = f.read()

# Fix the misleading explanation about negative values
old_text = 'Utility values are derived from conjoint analysis of respondent preferences. Positive values indicate features that increase purchase likelihood, while negative values indicate features that decrease it.'

new_text = 'Utility values are derived from conjoint analysis using a zero-centered hierarchical Bayesian model. Since utilities are zero-centered, both positive and negative values can indicate preference - what matters is the relative difference between options. Higher values (whether positive or negative) indicate stronger preference compared to lower values.'

if old_text in content:
    content = content.replace(old_text, new_text)
    print("✓ Updated utility values explanation")
else:
    # Try a simpler search
    import re
    pattern = r'Positive values indicate features that increase purchase.*?decrease it\.'
    replacement = 'Since utilities are zero-centered from the conjoint model, negative values don\'t mean decreased preference - they\'re simply below the centered mean. What matters is the relative utility: higher values (even if negative) are preferred to lower values.'
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    print("✓ Fixed utility explanation with regex")

with open('src/components/AttributeImpactModal.tsx', 'w') as f:
    f.write(content)

print("Updated to accurately explain zero-centered utilities")
