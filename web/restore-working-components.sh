#!/bin/bash

echo "🚨 RESTORING COMPONENTS FROM 5+ HOURS AGO"
echo "========================================"

# Get commits from the last 6 hours
CUTOFF_TIME=$(date -d '6 hours ago' '+%Y-%m-%d %H:%M:%S')
echo "Looking for commits before: $CUTOFF_TIME"

# Get commits with timestamps
git log --since="12 hours ago" --until="5 hours ago" --oneline --date=iso > recent_commits.log
echo "Found these commits from before 5 hours ago:"
cat recent_commits.log

# Try the most recent commit from that time period
if [ -s recent_commits.log ]; then
    RESTORE_COMMIT=$(head -1 recent_commits.log | cut -d' ' -f1)
    echo ""
    echo "Attempting to restore from commit: $RESTORE_COMMIT"
    
    # Restore AboutModelModal
    if git show $RESTORE_COMMIT:src/components/AboutModelModal.tsx >/dev/null 2>&1; then
        echo "✅ Restoring AboutModelModal.tsx"
        git show $RESTORE_COMMIT:src/components/AboutModelModal.tsx > src/components/AboutModelModal.tsx
        echo "   Restored with $(wc -l < src/components/AboutModelModal.tsx) lines"
    else
        echo "❌ AboutModelModal.tsx not found in commit $RESTORE_COMMIT"
    fi
    
    # Restore CNNUtilitiesModal
    if git show $RESTORE_COMMIT:src/components/CNNUtilitiesModal.tsx >/dev/null 2>&1; then
        echo "✅ Restoring CNNUtilitiesModal.tsx"
        git show $RESTORE_COMMIT:src/components/CNNUtilitiesModal.tsx > src/components/CNNUtilitiesModal.tsx
        echo "   Restored with $(wc -l < src/components/CNNUtilitiesModal.tsx) lines"
    else
        echo "❌ CNNUtilitiesModal.tsx not found in commit $RESTORE_COMMIT"
    fi
    
    # Restore AttributeImpactModal
    if git show $RESTORE_COMMIT:src/components/AttributeImpactModal.tsx >/dev/null 2>&1; then
        echo "✅ Restoring AttributeImpactModal.tsx"
        git show $RESTORE_COMMIT:src/components/AttributeImpactModal.tsx > src/components/AttributeImpactModal.tsx
        echo "   Restored with $(wc -l < src/components/AttributeImpactModal.tsx) lines"
    else
        echo "❌ AttributeImpactModal.tsx not found in commit $RESTORE_COMMIT"
    fi
    
    # Restore PasswordProtect
    if git show $RESTORE_COMMIT:src/components/cnn-analyzer/PasswordProtect.tsx >/dev/null 2>&1; then
        echo "✅ Restoring PasswordProtect.tsx"
        git show $RESTORE_COMMIT:src/components/cnn-analyzer/PasswordProtect.tsx > src/components/cnn-analyzer/PasswordProtect.tsx
        echo "   Restored with $(wc -l < src/components/cnn-analyzer/PasswordProtect.tsx) lines"
    else
        echo "❌ PasswordProtect.tsx not found in commit $RESTORE_COMMIT"
    fi
    
else
    echo "❌ No commits found from 5+ hours ago. Trying broader search..."
    
    # Try searching all recent commits
    for commit in $(git log --oneline -20 | cut -d' ' -f1); do
        echo "Checking commit $commit..."
        
        if git show $commit:src/components/AboutModelModal.tsx >/dev/null 2>&1; then
            LINES=$(git show $commit:src/components/AboutModelModal.tsx | wc -l)
            if [ $LINES -gt 50 ]; then
                echo "✅ Found substantial AboutModelModal in $commit ($LINES lines)"
                git show $commit:src/components/AboutModelModal.tsx > src/components/AboutModelModal.tsx
                break
            fi
        fi
    done
fi

echo ""
echo "Restoration complete. Current file sizes:"
for file in "src/components/AboutModelModal.tsx" "src/components/CNNUtilitiesModal.tsx" "src/components/AttributeImpactModal.tsx" "src/components/cnn-analyzer/PasswordProtect.tsx"; do
    if [ -f "$file" ]; then
        echo "  $file: $(wc -l < "$file") lines"
    else
        echo "  $file: MISSING"
    fi
done