import json

print("Loading respondentUtilities.json...")
with open('src/data/respondentUtilities.json', 'r') as f:
    data = json.load(f)

# The data is likely [{respondent_dict}]
if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
    # Convert from [{id: data, id: data}] to [data, data, data]
    respondent_dict = data[0]
    fixed_data = list(respondent_dict.values())
    
    print(f"Found {len(fixed_data)} respondents")
    print("First respondent:", fixed_data[0] if fixed_data else "None")
    
    # Save the fixed version
    with open('src/data/respondentUtilities.json', 'w') as f:
        json.dump(fixed_data, f)
    
    print("Fixed and saved!")
else:
    print("Unexpected structure:", type(data))
    if isinstance(data, list):
        print(f"List length: {len(data)}")
