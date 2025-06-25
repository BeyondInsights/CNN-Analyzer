#!/bin/bash

echo "🔍 CHECKING WHAT FILES HAVE BEEN REMOVED OR MODIFIED"
echo "=================================================="
echo ""

echo "📋 Git status - what's changed:"
git status --porcelain

echo ""
echo "📋 Recently deleted files (if any):"
git log --diff-filter=D --summary --oneline -10 | grep delete || echo "No deleted files found in recent commits"

echo ""
echo "📋 Files that existed before but might be missing now:"
echo "Checking for component files that should exist..."

EXPECTED_FILES=(
    "src/components/AboutModelModal.tsx"
    "src/components/CNNUtilitiesModal.tsx" 
    "src/components/AttributeImpactModal.tsx"
    "src/components/cnn-analyzer/PasswordProtect.tsx"
    "src/components/MarketFactorsModal.module.css"
    "src/lib/serverDataLoader.ts"
    "src/lib/firebaseClient.ts"
    "src/app/actions.ts"
)

for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ EXISTS: $file"
    else
        echo "❌ MISSING: $file"
    fi
done

echo ""
echo "📋 Checking what I may have removed by looking at recent commits:"
git log --oneline -5

echo ""
echo "📋 Checking for any .orig, .backup, or similar files I may have created:"
find . -name "*.orig" -o -name "*.backup" -o -name "*.bak" 2>/dev/null || echo "No backup files found"