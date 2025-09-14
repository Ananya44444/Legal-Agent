#!/bin/bash

# Script to set up Vector Search index in Vertex AI
echo "Setting up Vector Search index..."

PROJECT_ID="legal-rag-project"
REGION="us-central1"
INDEX_ID="legal_docs_index"

# Initialize Python virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create Python script for index setup
cat > setup_index.py << EOL
from google.cloud import aiplatform

# Initialize Vertex AI
aiplatform.init(project="$PROJECT_ID", location="$REGION")

# Create vector search index
index = aiplatform.MatchingEngineIndex.create(
    display_name="$INDEX_ID",
    dimensions=768,  # Dimension of the embeddings
    approximate_neighbor_count=10,
    distance_measure_type="DOT_PRODUCT_DISTANCE",
    description="Vector index for legal document chunks"
)

print(f"Created index: {index.name}")
EOL

# Run setup script
python setup_index.py

echo "Vector Search index setup completed!"