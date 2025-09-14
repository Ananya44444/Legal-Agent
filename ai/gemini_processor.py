"""
Gemini text generation for legal document summarization
"""

from google.cloud import aiplatform
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class GeminiProcessor:
    def __init__(self, project_id: str = "legal-rag-project"):
        self.project_id = project_id
        self.location = "us-central1"
        aiplatform.init(project=project_id, location=self.location)
        
    def generate_summary(self, chunks: List[Dict], query: str) -> Dict:
        """Generate a summary from relevant chunks using Gemini"""
        try:
            # Initialize Gemini model
            model = aiplatform.TextGenerationModel.from_pretrained("text-bison@001")
            
            # Prepare context from chunks
            context = "\n".join([
                f"[Page {chunk['page']}] {chunk['content']}"
                for chunk in chunks
            ])
            
            # Create prompt with disclaimer
            prompt = f"""Based on the following excerpts from a legal document, answer this question: {query}

Context from document:
{context}

Important requirements:
1. Base your answer only on the provided context
2. Include relevant page citations in your answer
3. Use plain, easy-to-understand language
4. If the context doesn't contain enough information, say so

Disclaimer: This is educational guidance only, not legal advice."""

            # Generate response
            response = model.predict(prompt)
            
            return {
                "summary": response.text,
                "sources": [{"page": chunk["page"], "score": chunk["score"]} for chunk in chunks],
                "disclaimer": "This response provides educational guidance only, not legal advice. Please consult a qualified legal professional for advice."
            }
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise
