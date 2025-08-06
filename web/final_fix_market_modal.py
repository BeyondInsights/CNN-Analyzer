#!/usr/bin/env python3

# Read the current file
with open('src/components/MarketFactorsModal.tsx', 'r') as f:
    lines = f.readlines()

# Find and update each label with its description
updates = [
    ('Market Awareness', 'Market Awareness', 'Market Awareness <span className="text-xs text-gray-500 block">% aware product exists. New: 20-40%, Established: 60-80%</span>'),
    ('Distribution Reach', 'Distribution Reach', 'Distribution Reach <span className="text-xs text-gray-500 block">Payment/platform access. Basic: 70%, Good: 85%, Excellent: 95%</span>'),
    ('Competitive Factor', 'Competitive Factor', 'Competitive Factor <span className="text-xs text-gray-500 block">vs. competitors. Weak: 50-70%, Parity: 70-85%, Strong: 85-100%</span>'),
    ('Marketing Effectiveness', 'Marketing Effectiveness', 'Marketing Effectiveness <span className="text-xs text-gray-500 block">Conversion rate. Poor: 40-60%, Average: 60-80%, Best: 80-95%</span>'),
    ('Year One Adoption', 'Year One Adoption', 'Year One Adoption <span className="text-xs text-gray-500 block">Y1 adoption %. Conservative: 40-60%, Moderate: 60-75%, Aggressive: 75-90%</span>')
]

# Process line by line
new_lines = []
for line in lines:
    updated_line = line
    for search, _, replace in updates:
        if search in line and '<label' in line and 'className="block text-sm font-medium"' in line:
            # Replace just the label text part
            updated_line = line.replace(
                f'{search} <span className="text-gray-500">({{settings',
                f'{replace} <span className="text-gray-500">({{settings'
            )
    new_lines.append(updated_line)

with open('src/components/MarketFactorsModal.tsx', 'w') as f:
    f.writelines(new_lines)

print("✓ Added descriptions to Market Factors")
