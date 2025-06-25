#!/bin/bash

echo "🔍 SEARCHING FOR ANY EXISTING ORIGINAL COMPONENTS"
echo "==============================================="

# Search for any files that might contain the original components
echo "Searching entire project for component backups..."

find . -name "*Modal*" -type f | grep -v node_modules | grep -v .git | head -10
find . -name "*Password*" -type f | grep -v node_modules | grep -v .git | head -10

echo ""
echo "Checking if git stash has any components..."
git stash list | head -5

echo ""
echo "Checking recent file operations..."
git log --stat -5 | grep -E "(Modal|Password)" | head -10

echo ""
echo "Looking for any temporary or backup files..."
find . -name "*.bak" -o -name "*.backup" -o -name "*.orig" -o -name "*.tmp" | grep -v node_modules | head -10