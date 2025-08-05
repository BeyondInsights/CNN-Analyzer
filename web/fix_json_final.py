import json

print("Loading respondentUtilities.json...")

with open('src/data/respondentUtilities.json', 'r') as f:
    content = f.read()

# Remove extra opening bracket if present
if content.strip().startswith('[[{'):
    content = content.replace('[[{', '[{', 1)

# Parse the JSON
try:
    data = json.loads(content)
except json.JSONDecodeError as e:
    print(f"Initial parse failed at {e.pos}, attempting fix...")
    # Add missing bracket if needed
    if content.count('[') > content.count(']'):
        content = content.rstrip() + ']'
    data = json.loads(content)

print(f"Parsed successfully. Structure: {type(data)}, length: {len(data)}")

# The structure is [{id: respondent, id: respondent, ...}]
if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
    respondent_dict = data[0]
    print(f"Found object with {len(respondent_dict)} keys")
    
    # Extract all respondents
    respondents = []
    for key, value in respondent_dict.items():
        if isinstance(value, dict):
            # Ensure respondentId is set
            if 'respondentId' not in value:
                value['respondentId'] = key
            respondents.append(value)
    
    print(f"Extracted {len(respondents)} respondents")
    
    # Show sample
    if respondents:
        print("First respondent sample:", list(respondents[0].keys())[:5])
    
    # Save as proper array
    with open('src/data/respondentUtilities.json', 'w') as f:
        json.dump(respondents, f)
    
    print("Saved as proper array of respondents")
    
    # Copy to public
    import shutil
    shutil.copy('src/data/respondentUtilities.json', 'public/data/respondentUtilities.json')
    print("Copied to public/data/")
    
    # Verify
    with open('src/data/respondentUtilities.json', 'r') as f:
        test = json.load(f)
    print(f"Verification: {len(test)} respondents in array format")

else:
    print("Unexpected structure - data might already be fixed")
    print(f"Type: {type(data)}, Length: {len(data) if isinstance(data, list) else 'N/A'}")
