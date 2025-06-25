#!/bin/bash

echo "🔍 Running comprehensive TypeScript and ESLint checks..."
echo "================================================="

# Run TypeScript check and capture all errors
echo "📝 Checking TypeScript errors..."
echo "---------------------------------"

# Use tsc to show ALL TypeScript errors at once
npx tsc --noEmit --skipLibCheck --pretty --incremental false --listFiles false 2>&1 | tee ts-errors.log

TS_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "🔍 Checking ESLint errors..."
echo "----------------------------"

# Run ESLint and show all errors
npx next lint --max-warnings 0 2>&1 | tee eslint-errors.log

ESLINT_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "📊 Error Summary:"
echo "=================="

if [ $TS_EXIT_CODE -ne 0 ]; then
    echo "❌ TypeScript errors found (see ts-errors.log)"
    echo "📄 TypeScript error count:"
    grep -c "error TS" ts-errors.log || echo "0"
else
    echo "✅ No TypeScript errors"
fi

if [ $ESLINT_EXIT_CODE -ne 0 ]; then
    echo "❌ ESLint errors found (see eslint-errors.log)"
    echo "📄 ESLint error count:"
    grep -c "Error:" eslint-errors.log || echo "0"
else
    echo "✅ No ESLint errors"
fi

echo ""
echo "🏗️ Starting Next.js build..."
echo "============================="

# Now run the actual build
npm run build:next

BUILD_EXIT_CODE=$?

echo ""
echo "🎯 Final Status:"
echo "================"
echo "TypeScript: $([ $TS_EXIT_CODE -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "ESLint: $([ $ESLINT_EXIT_CODE -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "Build: $([ $BUILD_EXIT_CODE -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL")"

# Exit with non-zero if any step failed
if [ $TS_EXIT_CODE -ne 0 ] || [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "💡 Check the logs above for all errors that need to be fixed."
    exit 1
else
    echo ""
    echo "🎉 All checks passed!"
    exit 0
fi
