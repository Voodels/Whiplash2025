#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "Cleaning logs/ and stray .log files..."
rm -f ./*.log || true
rm -rf logs/* || true

echo "Removing __pycache__ and *.pyc..."
find . -type d -name "__pycache__" -prune -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

echo "Done."
