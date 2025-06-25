#!/bin/bash

echo "🚨 RESTORING 4 SPECIFIC FILES FROM GIT HISTORY"
echo "=============================================="

# Find commits that had these specific files before I fucked them up
echo "Searching git history for original files..."

FILES_TO_RESTORE=(
    "src/components/CNNUtilitiesModal.tsx"
    "src/components/AttributeImpactModal.tsx" 
    "src/components/cnn-analyzer/PasswordProtect.tsx"
    "src/components/AboutModelModal.tsx"
)

# Go through recent commits to find originals
for commit in $(git log --oneline -15 | cut -d' ' -f1); do
    echo "Checking commit: $commit"
    
    for file in "${FILES_TO_RESTORE[@]}"; do
        if git ls-tree $commit "$file" >/dev/null 2>&1; then
            LINES=$(git show $commit:"$file" | wc -l)
            echo "  Found $file in $commit ($LINES lines)"
            
            # Save the version
            BASENAME=$(basename "$file" .tsx)
            git show $commit:"$file" > "${BASENAME}.commit-${commit}.tsx"
            echo "    Saved to ${BASENAME}.commit-${commit}.tsx"
        fi
    done
    echo ""
done

echo "All recovered versions:"
ls -la *.commit-*.tsx

echo ""
echo "Now restoring the largest/most complete versions..."

# Restore CNNUtilitiesModal - find the largest version
LARGEST_CNN=$(ls -la CNNUtilitiesModal.commit-*.tsx 2>/dev/null | sort -k5 -nr | head -1 | awk '{print $9}')
if [ ! -z "$LARGEST_CNN" ]; then
    echo "Restoring CNNUtilitiesModal from $LARGEST_CNN"
    cp "$LARGEST_CNN" src/components/CNNUtilitiesModal.tsx
    echo "✅ CNNUtilitiesModal restored ($(wc -l < src/components/CNNUtilitiesModal.tsx) lines)"
else
    echo "❌ No CNNUtilitiesModal backup found"
fi

# Restore AttributeImpactModal
LARGEST_ATTR=$(ls -la AttributeImpactModal.commit-*.tsx 2>/dev/null | sort -k5 -nr | head -1 | awk '{print $9}')
if [ ! -z "$LARGEST_ATTR" ]; then
    echo "Restoring AttributeImpactModal from $LARGEST_ATTR"
    cp "$LARGEST_ATTR" src/components/AttributeImpactModal.tsx
    echo "✅ AttributeImpactModal restored ($(wc -l < src/components/AttributeImpactModal.tsx) lines)"
else
    echo "❌ No AttributeImpactModal backup found"
fi

# Restore PasswordProtect
LARGEST_PASS=$(ls -la PasswordProtect.commit-*.tsx 2>/dev/null | sort -k5 -nr | head -1 | awk '{print $9}')
if [ ! -z "$LARGEST_PASS" ]; then
    echo "Restoring PasswordProtect from $LARGEST_PASS"
    mkdir -p src/components/cnn-analyzer
    cp "$LARGEST_PASS" src/components/cnn-analyzer/PasswordProtect.tsx
    echo "✅ PasswordProtect restored ($(wc -l < src/components/cnn-analyzer/PasswordProtect.tsx) lines)"
else
    echo "❌ No PasswordProtect backup found"
fi

# Restore AboutModelModal
LARGEST_ABOUT=$(ls -la AboutModelModal.commit-*.tsx 2>/dev/null | sort -k5 -nr | head -1 | awk '{print $9}')
if [ ! -z "$LARGEST_ABOUT" ]; then
    echo "Restoring AboutModelModal from $LARGEST_ABOUT"
    cp "$LARGEST_ABOUT" src/components/AboutModelModal.tsx
    echo "✅ AboutModelModal restored ($(wc -l < src/components/AboutModelModal.tsx) lines)"
else
    echo "❌ No AboutModelModal backup found"
fi

echo ""
echo "RESTORATION COMPLETE"
echo "===================="
echo "Final file sizes:"
for file in "${FILES_TO_RESTORE[@]}"; do
    if [ -f "$file" ]; then
        echo "  $file: $(wc -l < "$file") lines"
    else
        echo "  $file: MISSING"
    fi
done