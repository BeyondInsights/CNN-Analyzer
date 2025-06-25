#!/bin/bash
echo "🔍 Running comprehensive build checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
ERRORS=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${YELLOW}📝 Checking TypeScript...${NC}"
if command_exists tsc; then
    if ! npx tsc --noEmit --skipLibCheck 2>&1 | tee typescript-errors.log; then
        echo -e "${RED}❌ TypeScript errors found (see typescript-errors.log)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ TypeScript check passed${NC}"
        rm -f typescript-errors.log
    fi
else
    echo -e "${BLUE}⚠️  TypeScript not installed, skipping check${NC}"
fi

echo -e "${YELLOW}🔍 Checking ESLint...${NC}"
if [ -f .eslintrc.json ] || [ -f .eslintrc.js ]; then
    if ! npx next lint --max-warnings 0 2>&1 | tee eslint-errors.log; then
        echo -e "${RED}❌ ESLint errors found (see eslint-errors.log)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ ESLint check passed${NC}"
        rm -f eslint-errors.log
    fi
else
    echo -e "${BLUE}⚠️  No ESLint config found, skipping${NC}"
fi

echo -e "${YELLOW}📦 Building Next.js app...${NC}"
if ! npx next build 2>&1 | tee build-errors.log; then
    echo -e "${RED}❌ Next.js build failed (see build-errors.log)${NC}"
    ERRORS=$((ERRORS + 1))
    
    # Extract just the error messages for quick view
    echo -e "\n${RED}Build errors summary:${NC}"
    grep -E "Type error:|Error:|error TS" build-errors.log | head -10
else
    echo -e "${GREEN}✅ Next.js build successful${NC}"
    rm -f build-errors.log
fi

# Check for common Netlify issues
echo -e "\n${YELLOW}🔍 Checking for common Netlify issues...${NC}"

# Check if next.config.js exists
if [ ! -f next.config.js ]; then
    echo -e "${RED}❌ next.config.js not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    # Check if TypeScript errors are ignored
    if grep -q "ignoreBuildErrors: true" next.config.js; then
        echo -e "${GREEN}✅ TypeScript errors ignored in build${NC}"
    else
        echo -e "${YELLOW}⚠️  TypeScript errors not ignored - build may fail on type errors${NC}"
    fi
fi

# Check package.json for proper build command
if grep -q '"build": "next build || true"' package.json; then
    echo -e "${GREEN}✅ Build command has fallback${NC}"
elif grep -q '"build": "next build"' package.json; then
    echo -e "${BLUE}ℹ️  Standard build command (no fallback)${NC}"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Safe to deploy.${NC}"
    exit 0
else
    echo -e "${RED}💥 Found $ERRORS error(s). Fix these before deploying.${NC}"
    echo -e "${YELLOW}📋 Error logs saved to:${NC}"
    [ -f typescript-errors.log ] && echo "   - typescript-errors.log"
    [ -f eslint-errors.log ] && echo "   - eslint-errors.log"
    [ -f build-errors.log ] && echo "   - build-errors.log"
    exit 1
fi
