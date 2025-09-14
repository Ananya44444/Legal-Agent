#!/bin/bash

# Deploy Firebase Functions and Hosting
echo "Deploying Firebase Functions and Hosting..."

# Install dependencies
cd functions
npm install

# Deploy
firebase deploy --only functions,hosting

echo "Firebase deployment completed!"