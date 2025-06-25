#!/bin/bash

echo "🚨 RESTORING ALL DELETED COMPONENTS IMMEDIATELY"
echo "=============================================="

# Check git history to find the original components
echo "📋 Checking git history for original components..."

# Try to find the most recent commit that had these files
RECENT_COMMIT=$(git log --oneline -20 | head -1 | cut -d' ' -f1)

echo "Checking commits for original components..."
for commit in $(git log --oneline -10 | cut -d' ' -f1); do
    echo "Checking commit $commit:"
    
    if git show $commit:src/components/AboutModelModal.tsx >/dev/null 2>&1; then
        echo "  ✅ Found AboutModelModal.tsx in commit $commit"
        ABOUT_COMMIT=$commit
    fi
    
    if git show $commit:src/components/CNNUtilitiesModal.tsx >/dev/null 2>&1; then
        echo "  ✅ Found CNNUtilitiesModal.tsx in commit $commit"
        CNN_COMMIT=$commit
    fi
    
    if git show $commit:src/components/AttributeImpactModal.tsx >/dev/null 2>&1; then
        echo "  ✅ Found AttributeImpactModal.tsx in commit $commit"
        ATTR_COMMIT=$commit
    fi
    
    if git show $commit:src/components/cnn-analyzer/PasswordProtect.tsx >/dev/null 2>&1; then
        echo "  ✅ Found PasswordProtect.tsx in commit $commit"
        PASS_COMMIT=$commit
    fi
done

echo ""
echo "📥 RESTORING ORIGINAL COMPONENTS NOW..."

# Restore AboutModelModal if found
if [ ! -z "$ABOUT_COMMIT" ]; then
    echo "Restoring original AboutModelModal.tsx from commit $ABOUT_COMMIT"
    git show $ABOUT_COMMIT:src/components/AboutModelModal.tsx > src/components/AboutModelModal.tsx.original
    echo "✅ Original AboutModelModal saved to AboutModelModal.tsx.original"
fi

# Restore CNNUtilitiesModal if found
if [ ! -z "$CNN_COMMIT" ]; then
    echo "Restoring original CNNUtilitiesModal.tsx from commit $CNN_COMMIT"
    git show $CNN_COMMIT:src/components/CNNUtilitiesModal.tsx > src/components/CNNUtilitiesModal.tsx.original
    echo "✅ Original CNNUtilitiesModal saved to CNNUtilitiesModal.tsx.original"
fi

# Restore AttributeImpactModal if found
if [ ! -z "$ATTR_COMMIT" ]; then
    echo "Restoring original AttributeImpactModal.tsx from commit $ATTR_COMMIT"
    git show $ATTR_COMMIT:src/components/AttributeImpactModal.tsx > src/components/AttributeImpactModal.tsx.original
    echo "✅ Original AttributeImpactModal saved to AttributeImpactModal.tsx.original"
fi

# Restore PasswordProtect if found
if [ ! -z "$PASS_COMMIT" ]; then
    echo "Restoring original PasswordProtect.tsx from commit $PASS_COMMIT"
    git show $PASS_COMMIT:src/components/cnn-analyzer/PasswordProtect.tsx > src/components/cnn-analyzer/PasswordProtect.tsx.original
    echo "✅ Original PasswordProtect saved to PasswordProtect.tsx.original"
fi

echo ""
echo "📋 Checking what the originals contained..."
echo ""

if [ -f "src/components/AboutModelModal.tsx.original" ]; then
    echo "=== ORIGINAL AboutModelModal.tsx ==="
    head -30 src/components/AboutModelModal.tsx.original
    echo ""
fi

if [ -f "src/components/CNNUtilitiesModal.tsx.original" ]; then
    echo "=== ORIGINAL CNNUtilitiesModal.tsx ==="
    head -30 src/components/CNNUtilitiesModal.tsx.original
    echo ""
fi