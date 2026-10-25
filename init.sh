#!/bin/bash
set -e

echo "=== Harness Initialization ==="

echo "=== Checking app.mjs syntax ==="
node --check app.mjs

echo "=== Checking quiz-core.mjs syntax ==="
node --check quiz-core.mjs

echo "=== Checking dev-server.mjs syntax ==="
node --check dev-server.mjs

echo "=== Validating content and required files ==="
node scripts/verify.mjs

echo "=== Running unit tests ==="
node tests/quiz-core.test.mjs

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Run node dev-server.mjs and open the URL it prints (default http://127.0.0.1:4173)"
echo "3. Walk the path in DEMO.md before handing over"
