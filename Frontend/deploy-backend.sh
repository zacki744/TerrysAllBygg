#!/usr/bin/env bash
set -e

echo "Building Next.js..."
npm run build

BACKEND_WWWROOT="../TABB/API/wwwroot/app"

echo "Cleaning old frontend..."
rm -rf "$BACKEND_WWWROOT"

echo "Creating folders..."
mkdir -p "$BACKEND_WWWROOT"

echo "Copying static export..."
cp -r out/* "$BACKEND_WWWROOT"

echo "Deploy completed ✅"
