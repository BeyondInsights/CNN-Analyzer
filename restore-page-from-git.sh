#!/usr/bin/env bash
set -e

# find the commit just before 6 AM today
TARGET_TIME=$(date --iso-8601=seconds -d 'today 06:00')
COMMIT=$(git rev-list -n 1 --before="$TARGET_TIME" HEAD)

# show its date
echo "Restoring src/app/page.tsx from commit $COMMIT"
echo "Commit date: $(git show -s --format="%ci" $COMMIT -- src/app/page.tsx)"

# dump that version into a new file
git show ${COMMIT}:src/app/page.tsx > src/app/page.restore.tsx

echo "Wrote restored version to src/app/page.restore.tsx"
