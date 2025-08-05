import json
import re

print("Loading and fixing respondentUtilities.json...")

with open('src/data/respondentUtilities.json', 'r') as f:
    content = f.read()

# Remove extra opening bracket
if content.strip().startswith('[[{'):
    content = content.replace('[[{', '[{', 1)
    print("Fixed extra opening bracket")

# Try to find where the JSON breaks
try:
    # Try parsing
    data = json.loads(content)
    print("JSON parsed successfully!")
except json.JSONDecodeError as e:
    print(f"JSON error at position {e.pos}: {e.msg}")
    
    # Try to fix common issues
    # Check if there's a missing closing bracket
    if content.count('[') > content.count(']'):
        content = content.rstrip() + ']'
        print("Added missing closing bracket")
    
    # Try again
    try:
        data = json.loads(content)
        print("JSON fixed and parsed!")
    except:
        # More aggressive fix - extract just the data between outer brackets
        print("Attempting aggressive fix...")
        
        # Find the first { after [
        start = content.find('[') + 1
        # Find the last } before ]
        end = content.rfind('}') + 1
        
        # Extract and wrap properly
        inner_content = content[start:end].strip()
        
        # If it's a single object with IDs as keys
        if inner_content.startswith('{'):
            # Parse as object and extract values
            try:
                obj_data = json.loads(inner_content)
                data = list(obj_data.values())
                print(f"Extracted {len(data)} respondents from object structure")
            except:
                print("Failed to parse as object")
                raise
        else:
            print("Unexpected structure")
            raise

# Now we should have valid data
if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
    # Convert from [{id: data}] to [data]
    respondent_dict = data[0]
    fixed_data = list(respondent_dict.values())
    print(f"Converted: Found {len(fixed_data)} respondents")
else:
    fixed_data = data
    print(f"Data structure OK: {len(data)} items")

# Save the fixed version
with open('src/data/respondentUtilities_clean.json', 'w') as f:
    json.dump(fixed_data, f, indent=2)

print("Saved to respondentUtilities_clean.json")

# Verify it's valid
with open('src/data/respondentUtilities_clean.json', 'r') as f:
    test = json.load(f)
    print(f"Verification successful: {len(test)} respondents")

# Replace original
import shutil
shutil.move('src/data/respondentUtilities_clean.json', 'src/data/respondentUtilities.json')
shutil.copy('src/data/respondentUtilities.json', 'public/data/respondentUtilities.json')
print("Replaced original and copied to public/data/")
