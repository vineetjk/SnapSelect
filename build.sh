#!/bin/bash
set -e

echo "Installing backend dependencies (including dev dependencies)..."
cd backend
npm install --include=dev

echo "Building backend..."
npm run build

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Build completed successfully!"
cd ..
