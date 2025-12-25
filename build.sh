#!/bin/bash
set -e

echo "Installing backend dependencies..."
cd backend
npm install

echo "Building backend..."
npm run build

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Build completed successfully!"
cd ..
