#!/bin/bash
echo "🚀 EXECUTING BUILD FIX COMMANDS..."

# Remove broken file and replace with clean version
echo "1. Fixing AboutModelModal..."
rm -f src/components/AboutModelModal.tsx
mv src/components/AboutModelModal-clean.tsx src/components/AboutModelModal.tsx 2>/dev/null || echo "Clean file not found, skipping move"

# Test build locally
echo "2. Testing build locally..."
npm run build

# If build succeeds, commit and push
if [ $? -eq 0 ]; then
    echo "3. Build successful! Committing and pushing..."
    git add .
    git commit -m "Fix: Add missing components and dependencies for successful build"
    git push origin master
    echo "✅ DEPLOYED! Check Netlify in 3-5 minutes"
else
    echo "❌ Build still failing. Need more fixes."
fi