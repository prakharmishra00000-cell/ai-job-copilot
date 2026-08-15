#!/bin/bash
# Auto-deploy script for JobPilot AI
# This script commits and pushes changes to GitHub
# Render will auto-deploy when it detects changes

set -e

# Get commit message from argument or use default
MESSAGE="${1:-🔄 Update JobPilot AI}"

echo "📦 Preparing deployment..."

# Add all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Commit changes
git commit -m "$MESSAGE"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployed successfully!"
echo "🔗 GitHub: https://github.com/prakharmishra00000-cell/ai-job-copilot"
echo "🌐 Render will auto-deploy in ~2 minutes"
