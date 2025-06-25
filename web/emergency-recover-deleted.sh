#!/bin/bash

echo "🚨 EMERGENCY RECOVERY - SEARCHING FOR DELETED COMPONENTS"
echo "======================================================="

# Try to find commits that had the original components
echo "Searching git history for original components..."

# Look for commits that had these files
for commit in $(git log --oneline | head -20 | cut -d' ' -f1); do
    echo "Checking commit: $commit"
    
    # Check AboutModelModal
    if git ls-tree $commit src/components/AboutModelModal.tsx >/dev/null 2>&1; then
        echo "  Found AboutModelModal in commit $commit"
        git show $commit:src/components/AboutModelModal.tsx > AboutModelModal.original.$commit.tsx
        echo "  Saved to AboutModelModal.original.$commit.tsx"
    fi
    
    # Check CNNUtilitiesModal
    if git ls-tree $commit src/components/CNNUtilitiesModal.tsx >/dev/null 2>&1; then
        echo "  Found CNNUtilitiesModal in commit $commit"
        git show $commit:src/components/CNNUtilitiesModal.tsx > CNNUtilitiesModal.original.$commit.tsx
        echo "  Saved to CNNUtilitiesModal.original.$commit.tsx"
    fi
    
    # Check AttributeImpactModal
    if git ls-tree $commit src/components/AttributeImpactModal.tsx >/dev/null 2>&1; then
        echo "  Found AttributeImpactModal in commit $commit"
        git show $commit:src/components/AttributeImpactModal.tsx > AttributeImpactModal.original.$commit.tsx
        echo "  Saved to AttributeImpactModal.original.$commit.tsx"
    fi
    
    # Check PasswordProtect
    if git ls-tree $commit src/components/cnn-analyzer/PasswordProtect.tsx >/dev/null 2>&1; then
        echo "  Found PasswordProtect in commit $commit"
        git show $commit:src/components/cnn-analyzer/PasswordProtect.tsx > PasswordProtect.original.$commit.tsx
        echo "  Saved to PasswordProtect.original.$commit.tsx"
    fi
done

echo ""
echo "RECOVERED FILES:"
ls -la *.original.*.tsx 2>/dev/null || echo "No original files recovered"

echo ""
echo "If any files were recovered, showing first 30 lines of each:"

for file in *.original.*.tsx; do
    if [ -f "$file" ]; then
        echo "=== $file ==="
        head -30 "$file"
        echo ""
    fi
done