"""
Flask API service for the Legal RAG system
"""

from flask import Flask, request, jsonify
from document_processor import LegalDocumentProcessor
from embeddings import EmbeddingsGenerator
from vector_search import VectorSearch
from gemini_processor import GeminiProcessor
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize components
document_processor = LegalDocumentProcessor()
embeddings_generator = EmbeddingsGenerator()
vector_search = VectorSearch()
gemini_processor = GeminiProcessor()

@app.route("/process_document", methods=["POST"])
def process_document():
    """Process a new document: extract text, generate embeddings, store in vector search"""
    try:
        data = request.json
        document_path = data.get("document_path")
        user_id = data.get("user_id")
        
        if not document_path:
            return jsonify({"error": "No document path provided"}), 400
            
        # Extract and chunk text
        extraction_result = document_processor.extract_text(document_path)
        chunks = document_processor.chunk_text(extraction_result["text"])
        
        # Generate embeddings
        embeddings = embeddings_generator.generate_embeddings(
            [chunk["content"] for chunk in chunks]
        )
        
        # Store in vector search with metadata
        metadata = {
            "user_id": user_id,
            "document_path": document_path,
            "language": "en",
            "jurisdiction": "US"
        }
        vector_search.store_embeddings(embeddings, chunks, metadata)
        
        return jsonify({
            "status": "success",
            "chunks": len(chunks),
            "disclaimer": "This system provides educational guidance only, not legal advice."
        })
        
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        return jsonify({
            "error": str(e),
            "disclaimer": "This system provides educational guidance only, not legal advice."
        }), 500

@app.route("/query", methods=["POST"])
def query():
    """Query documents using RAG with Gemini"""
    try:
        data = request.json
        query = data.get("query")
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
            
        # Generate query embedding
        query_embedding = embeddings_generator.generate_embeddings([query])[0]
        
        # Retrieve relevant chunks
        chunks = vector_search.retrieve_chunks(query_embedding)
        
        # Generate summary with Gemini
        response = gemini_processor.generate_summary(chunks, query)
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return jsonify({
            "error": str(e),
            "disclaimer": "This system provides educational guidance only, not legal advice."
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
