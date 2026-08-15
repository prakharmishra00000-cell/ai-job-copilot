#!/usr/bin/env bash
# Render Build Script
# This script runs during the build phase on Render

set -e

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Pushing database schema..."
npx drizzle-kit push --force

echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build complete!"
