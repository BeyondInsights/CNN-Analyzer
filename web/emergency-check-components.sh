#!/bin/bash

echo "🚨 EMERGENCY: CHECKING FOR ORIGINAL COMPONENTS"
echo "============================================="

# Check if the current CNNUtilitiesModal is the full version
if [ -f "src/components/CNNUtilitiesModal.tsx" ]; then
    echo "📋 Current CNNUtilitiesModal.tsx status:"
    LINES=$(wc -l < src/components/CNNUtilitiesModal.tsx)
    echo "   Lines: $LINES"
    
    if [ $LINES -gt 100 ]; then
        echo "   ✅ FULL VERSION IS PRESENT ($LINES lines)"
    else
        echo "   ❌ TRUNCATED VERSION ($LINES lines)"
    fi
    
    echo "   First 10 lines:"
    head -10 src/components/CNNUtilitiesModal.tsx
else
    echo "❌ CNNUtilitiesModal.tsx MISSING"
fi

echo ""
echo "📋 Checking other components..."

for component in "AboutModelModal.tsx" "AttributeImpactModal.tsx" "cnn-analyzer/PasswordProtect.tsx"; do
    if [ -f "src/components/$component" ]; then
        LINES=$(wc -l < "src/components/$component")
        echo "   $component: $LINES lines"
        if [ $LINES -lt 50 ]; then
            echo "      ⚠️ POSSIBLY TRUNCATED (< 50 lines)"
        fi
    else
        echo "   ❌ $component MISSING"
    fi
done

echo ""
echo "📋 Checking git history for full versions..."
git log --oneline -10 | while read commit message; do
    if git show $commit:src/components/CNNUtilitiesModal.tsx >/dev/null 2>&1; then
        LINES=$(git show $commit:src/components/CNNUtilitiesModal.tsx | wc -l)
        echo "   Commit $commit: CNNUtilitiesModal had $LINES lines"
    fi
done