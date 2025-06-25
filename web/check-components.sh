#!/bin/bash

echo "🔍 DETAILED COMPONENT DIRECTORY ANALYSIS"
echo "========================================"
echo ""

echo "📁 Current contents of src/components/:"
ls -la src/components/ 2>/dev/null || echo "Components directory doesn't exist!"

echo ""
echo "📁 Current contents of src/components/cnn-analyzer/:"
ls -la src/components/cnn-analyzer/ 2>/dev/null || echo "CNN-analyzer directory doesn't exist!"

echo ""
echo "📋 Checking git history for component changes:"
echo "About Model Modal changes:"
git log --oneline --follow src/components/AboutModelModal.tsx 2>/dev/null || echo "No history for AboutModelModal.tsx"

echo ""
echo "📋 Checking what was in the original components (if any):"
git show HEAD~1:src/components/AboutModelModal.tsx 2>/dev/null | head -20 || echo "No previous version of AboutModelModal found"

echo ""
echo "📋 Files I may have deleted/overwritten in the last few operations:"
git diff HEAD~2 --name-status | grep -E "^D|^M" || echo "No deleted or heavily modified files found"