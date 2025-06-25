#!/bin/bash

echo "🚨 EMERGENCY COMPONENT RESTORATION"
echo "=================================="

# Get the commit hash from before I started making changes
BEFORE_COMMIT=$(git log --oneline | grep -E "(before|initial|original|working)" | head -1 | cut -d' ' -f1)

if [ -z "$BEFORE_COMMIT" ]; then
    # If no obvious commit, try going back several commits
    BEFORE_COMMIT=$(git log --oneline | sed -n '5p' | cut -d' ' -f1)
fi

echo "Attempting to restore from commit: $BEFORE_COMMIT"

# Try to restore each component
echo ""
echo "📥 Attempting to restore AboutModelModal..."
if git show $BEFORE_COMMIT:src/components/AboutModelModal.tsx >/dev/null 2>&1; then
    git show $BEFORE_COMMIT:src/components/AboutModelModal.tsx > /tmp/AboutModelModal.original.tsx
    echo "✅ Found original AboutModelModal - saved to /tmp/AboutModelModal.original.tsx"
    echo "Preview:"
    head -20 /tmp/AboutModelModal.original.tsx
else
    echo "❌ Could not find original AboutModelModal in commit $BEFORE_COMMIT"
fi

echo ""
echo "📥 Attempting to restore CNNUtilitiesModal..."
if git show $BEFORE_COMMIT:src/components/CNNUtilitiesModal.tsx >/dev/null 2>&1; then
    git show $BEFORE_COMMIT:src/components/CNNUtilitiesModal.tsx > /tmp/CNNUtilitiesModal.original.tsx
    echo "✅ Found original CNNUtilitiesModal - saved to /tmp/CNNUtilitiesModal.original.tsx"
    echo "Preview:"
    head -20 /tmp/CNNUtilitiesModal.original.tsx
else
    echo "❌ Could not find original CNNUtilitiesModal in commit $BEFORE_COMMIT"
fi

echo ""
echo "📥 Attempting to restore AttributeImpactModal..."
if git show $BEFORE_COMMIT:src/components/AttributeImpactModal.tsx >/dev/null 2>&1; then
    git show $BEFORE_COMMIT:src/components/AttributeImpactModal.tsx > /tmp/AttributeImpactModal.original.tsx
    echo "✅ Found original AttributeImpactModal - saved to /tmp/AttributeImpactModal.original.tsx"
    echo "Preview:"
    head -20 /tmp/AttributeImpactModal.original.tsx
else
    echo "❌ Could not find original AttributeImpactModal in commit $BEFORE_COMMIT"
fi

echo ""
echo "📥 Attempting to restore PasswordProtect..."
if git show $BEFORE_COMMIT:src/components/cnn-analyzer/PasswordProtect.tsx >/dev/null 2>&1; then
    git show $BEFORE_COMMIT:src/components/cnn-analyzer/PasswordProtect.tsx > /tmp/PasswordProtect.original.tsx
    echo "✅ Found original PasswordProtect - saved to /tmp/PasswordProtect.original.tsx"
    echo "Preview:"
    head -20 /tmp/PasswordProtect.original.tsx
else
    echo "❌ Could not find original PasswordProtect in commit $BEFORE_COMMIT"
fi