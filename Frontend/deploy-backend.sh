#!/usr/bin/env bash
set -e

echo "Building Vite + React..."
npm run build

BACKEND_WWWROOT="../TABB/API/wwwroot/app"

echo "Cleaning old frontend..."
rm -rf "$BACKEND_WWWROOT"

echo "Creating folder..."
mkdir -p "$BACKEND_WWWROOT"

echo "Copying build output..."
cp -r dist/* "$BACKEND_WWWROOT"

echo "Deploy completed ✅"
echo "Output → $BACKEND_WWWROOT"