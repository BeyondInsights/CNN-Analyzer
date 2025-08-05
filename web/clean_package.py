import json

with open('package.json', 'r') as f:
    package = json.load(f)

# Remove Firebase dependencies
firebase_deps = ['firebase', 'firebase-admin', '@firebase/app', '@firebase/auth', '@firebase/firestore', '@firebase/storage']

if 'dependencies' in package:
    for dep in firebase_deps:
        if dep in package['dependencies']:
            del package['dependencies'][dep]
            print(f"✓ Removed {dep}")

if 'devDependencies' in package:
    for dep in firebase_deps:
        if dep in package['devDependencies']:
            del package['devDependencies'][dep]
            print(f"✓ Removed {dep} from devDependencies")

with open('package.json', 'w') as f:
    json.dump(package, f, indent=2)

print("✓ Cleaned package.json")
