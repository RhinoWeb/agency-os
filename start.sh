#!/usr/bin/env bash
set -e

echo ""
echo "  ============================================"
echo "   AGENCY OS — Starting up..."
echo "  ============================================"
echo ""

# Check for updates
echo "  Checking for updates..."
if git fetch origin main --quiet 2>/dev/null; then
  COMMITS=$(git rev-list HEAD..origin/main --count 2>/dev/null || echo "0")
  if [ "$COMMITS" != "0" ] && [ -n "$COMMITS" ]; then
    echo ""
    echo "  [UPDATE AVAILABLE] $COMMITS new commit(s) on GitHub."
    echo ""
    read -r -p "   Apply update now? (y/n): " DOUPDATE
    if [[ "$DOUPDATE" =~ ^[Yy]$ ]]; then
      echo "  Pulling latest code..."
      git pull origin main
      echo "  Installing dependencies..."
      npm install --silent
      echo "  Update complete! Restarting..."
      echo ""
    fi
  else
    echo "  Agency OS is up to date."
  fi
else
  echo "  (Could not check for updates — offline or git not configured)"
fi

echo ""
echo "  Starting Agency OS..."
echo "  Open: http://localhost:5173"
echo ""
npm run dev
