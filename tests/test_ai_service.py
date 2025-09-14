"""
Test Flask API endpoints using mock services
"""
import os
import sys
from unittest.mock import Mock, patch
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from flask import json, Flask

# Create mocks
mock_doc_processor = Mock()
mock_embeddings = Mock()
mock_vector_search = Mock()
mock_gemini = Mock()

# Apply mocks before importing app
with patch('ai.ai_service.LegalDocumentProcessor', return_value=mock_doc_processor), \
     patch('ai.ai_service.EmbeddingsGenerator', return_value=mock_embeddings), \
     patch('ai.ai_service.VectorSearch', return_value=mock_vector_search), \
     patch('ai.ai_service.GeminiProcessor', return_value=mock_gemini):
    from ai.ai_service import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_process_document_missing_path(client):
    """Test /process_document endpoint with missing document path"""
    response = client.post('/process_document', 
                         json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert data["error"] == "No document path provided"
    assert "disclaimer" in data

def test_query_missing_query(client):
    """Test /query endpoint with missing query"""
    response = client.post('/query', 
                         json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert data["error"] == "No query provided"
    assert "disclaimer" in data