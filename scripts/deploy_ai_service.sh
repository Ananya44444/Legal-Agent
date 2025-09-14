#!/bin/bash

# Deploy AI service to Cloud Run
echo "Deploying AI service to Cloud Run..."

# Set variables
PROJECT_ID="legal-rag-project"
REGION="us-central1"
SERVICE_NAME="legal-rag-ai-service"

# Build and deploy
gcloud builds submit ai/ --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID"

echo "AI service deployment completed!"