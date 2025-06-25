#!/bin/bash

echo "🔍 Checking for Firebase imports in the codebase..."

# Check for any Firebase imports that might be causing build issues
echo "📝 Files with Firebase imports:"
grep -r "firebase" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -10

echo ""
echo "📝 Checking specific problematic files..."

# Check if secureSimulationSimple exists and what it imports
if [ -f "src/lib/secureSimulationSimple.ts" ]; then
    echo "✅ secureSimulationSimple.ts exists"
    head -10 src/lib/secureSimulationSimple.ts
else
    echo "❌ secureSimulationSimple.ts missing"
fi

echo ""
echo "📝 Current package.json Firebase dependencies:"
grep -i firebase package.json | head -5