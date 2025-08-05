#!/usr/bin/env python3

with open('src/components/cnn-analyzer/PasswordProtect.tsx', 'r') as f:
    lines = f.readlines()

# Remove the specified email addresses
emails_to_remove = [
    "    'brian.brett@beyondinsights.com',\n",
    "    'justin.eisenband@ftidelta.com',\n", 
    "    'shane.rahmani@ftidelta.com',\n"
]

filtered_lines = []
for line in lines:
    if line not in emails_to_remove:
        filtered_lines.append(line)

with open('src/components/cnn-analyzer/PasswordProtect.tsx', 'w') as f:
    f.writelines(filtered_lines)

print("✓ Removed specified email addresses from allowed list")
