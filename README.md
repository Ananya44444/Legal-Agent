## Legal RAG Translation System (MVP)

--
## Project Overview
This project develops a Retrieval-Augmented Generation (RAG) system to provide
plain-language explanations and educational guidance for rental agreements and consumer
loan contracts in English, focusing on Indian central laws. Users can upload encrypted PDF
documents, query them, and receive concise summaries with page citations for traceability. The
system uses Google Cloud AI tools (Vertex AI for embeddings and Gemini) and a Firebase
backend. The backend is Python-based (FastAPI for user requests and AI components), hosted
on Render. The front-end is a web interface on Firebase Hosting. Documents are encrypted
client-side using AES-256 before upload and decrypted server-side only during
processing to ensure confidentiality, with the encryption key stored securely in
environment variables.

--
## Regulatory Disclaimer
This system does not provide legal advice. It offers plain-language explanations and
educational guidance to help users understand rental agreements and consumer loan contracts.
Always consult a qualified advocate registered with the Bar Council of India for legal advice.


--
## Key Features (MVP)
●​ Document Processing: Extracts and chunks text from rental agreements and consumer
loan contracts using pdfplumber, PyPDF2, and pytesseract for OCR.

●​ Document Encryption: Encrypts PDFs client-side with AES-256 before upload to
Firebase Storage; decrypts server-side in a secure environment for processing.

●​ Embeddings and Vector Search: Generates embeddings with Vertex AI and stores
them in FAISS/Chroma for retrieval.

●​ Summary Generation: Uses Gemini (Vertex AI) to produce plain-language summaries
with page citations, grounded in document content. Outputs two files: one for full
summarization and another for key extracted information (e.g., effective dates,
termination clauses, penalties, interest rates).

●​ User Management: Handles authentication and stores user preferences (e.g., document
history) via Firebase Authentication and Firestore.

●​ Front-End: Provides a web interface for document uploads, queries, and viewing
summaries.

●​ Disclaimer: Clearly states the system provides educational guidance, not legal advice,
to ensure regulatory compliance.
