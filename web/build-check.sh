#!/bin/bash

echo "🔍 Running comprehensive build checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

echo -e "${YELLOW}📝 Checking TypeScript...${NC}"
if ! npx tsc --noEmit --skipLibCheck; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
fi

echo -e "${YELLOW}🔍 Checking ESLint...${NC}"
if ! npx next lint --max-warnings 0; then
    echo -e "${RED}❌ ESLint errors found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ ESLint check passed${NC}"
fi

echo -e "${YELLOW}📦 Building Next.js app...${NC}"
if ! npx next build; then
    echo -e "${RED}❌ Next.js build failed${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Next.js build successful${NC}"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Found $ERRORS error(s). Check output above for details.${NC}"
    exit 1
fi
