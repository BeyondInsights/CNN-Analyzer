#!/bin/bash

echo "🔍 CHECKING GIT REFLOG FOR RECENT CHANGES"
echo "======================================="

# Show recent git operations
echo "Recent git operations:"
git reflog --date=iso -10

echo ""
echo "Checking what files existed in recent commits..."

# Check the last 10 commits for these specific files
for i in {0..10}; do
    COMMIT=$(git log --oneline | sed -n "${i}p" | cut -d' ' -f1)
    if [ ! -z "$COMMIT" ]; then
        echo "Commit $COMMIT (HEAD~$((i-1))):"
        
        for file in "src/components/AboutModelModal.tsx" "src/components/CNNUtilitiesModal.tsx" "src/components/AttributeImpactModal.tsx" "src/components/cnn-analyzer/PasswordProtect.tsx"; do
            if git ls-tree $COMMIT "$file" >/dev/null 2>&1; then
                LINES=$(git show $COMMIT:"$file" | wc -l)
                echo "  ✅ $file exists ($LINES lines)"
                
                # If this is a substantial file, save it
                if [ $LINES -gt 20 ]; then
                    FILENAME=$(basename "$file" .tsx)
                    git show $COMMIT:"$file" > "${FILENAME}.backup.${COMMIT}.tsx"
                    echo "     Saved backup to ${FILENAME}.backup.${COMMIT}.tsx"
                fi
            else
                echo "  ❌ $file missing"
            fi
        done
        echo ""
    fi
done

echo "Backup files created:"
ls -la *.backup.*.tsx 2>/dev/null || echo "No backup files created"