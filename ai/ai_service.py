"""
Main AI service orchestrator
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from document_processor import LegalDocumentProcessor
from typing import Dict

class LegalAIService:
    """Main service for legal document AI processing"""
    
    def __init__(self, project_id: str = "legal-rag-project"):
        self.project_id = project_id
        self.document_processor = LegalDocumentProcessor(project_id)
        
    def process_document(self, file_path: str) -> Dict:
        """Process a legal document"""
        print(f"Processing document: {file_path}")
        
        try:
            extraction_result = self.document_processor.extract_text(file_path)
            chunks = self.document_processor.chunk_text(extraction_result["text"])
            
            return {
                "status": "success",
                "document_info": extraction_result["metadata"],
                "total_chunks": len(chunks),
                "message": "Document processed successfully"
            }
            
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Error: {str(e)}"
            }

if __name__ == "__main__":
    service = LegalAIService()
    print("AI service ready!")
    
    result = service.process_document("sample_lease.pdf")
    print(f"Service test: {result['status']}")
