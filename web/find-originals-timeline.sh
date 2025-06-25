#!/bin/bash

echo "🔍 LOOKING FOR ORIGINAL COMPONENTS IN CONVERSATION TIMELINE"
echo "========================================================="

# Check if there are any conversation references to the original components
echo "Looking for component files that were shown in the conversation..."

# Check git log for the exact time when files were last working
echo "Checking git commits from this morning when files were working..."

# Look for commits from today
TODAY=$(date '+%Y-%m-%d')
echo "Looking for commits from today: $TODAY"

git log --since="$TODAY 00:00:00" --until="$TODAY 23:59:59" --oneline --date=iso

echo ""
echo "Checking what files existed in recent commits..."

# Check the last several commits for substantial versions
for i in {1..15}; do
    COMMIT=$(git log --oneline | sed -n "${i}p" | cut -d' ' -f1)
    if [ ! -z "$COMMIT" ]; then
        COMMIT_DATE=$(git show -s --format=%ci $COMMIT | cut -d' ' -f1-2)
        echo "Commit $COMMIT ($COMMIT_DATE):"
        
        # Check each component file
        for file in "src/components/AboutModelModal.tsx" "src/components/CNNUtilitiesModal.tsx" "src/components/AttributeImpactModal.tsx" "src/components/cnn-analyzer/PasswordProtect.tsx"; do
            if git ls-tree $COMMIT "$file" >/dev/null 2>&1; then
                LINES=$(git show $COMMIT:"$file" | wc -l)
                
                # Save substantial files
                if [ $LINES -gt 50 ]; then
                    FILENAME=$(basename "$file" .tsx)
                    echo "  ✅ $file: $LINES lines (SUBSTANTIAL - saving)"
                    git show $COMMIT:"$file" > "ORIGINAL_${FILENAME}_${COMMIT}.tsx"
                else
                    echo "  ⚠️  $file: $LINES lines (may be placeholder)"
                fi
            else
                echo "  ❌ $file: missing"
            fi
        done
        echo ""
    fi
done

echo "SAVED ORIGINAL FILES:"
ls -la ORIGINAL_*.tsx 2>/dev/null || echo "No substantial original files found"

echo ""
echo "Checking the most substantial versions of each file..."

# Find the largest version of each component (likely the original)
for component in "AboutModelModal" "CNNUtilitiesModal" "AttributeImpactModal" "PasswordProtect"; do
    LARGEST_FILE=$(ls -la ORIGINAL_${component}_*.tsx 2>/dev/null | sort -k5 -nr | head -1 | awk '{print $NF}')
    
    if [ ! -z "$LARGEST_FILE" ]; then
        echo "Largest $component file: $LARGEST_FILE"
        echo "First 10 lines:"
        head -10 "$LARGEST_FILE"
        echo ""
    fi
done