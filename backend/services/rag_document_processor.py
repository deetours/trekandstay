"""
RAG Document Processor
Handles document loading, chunking, and embedding generation
"""

import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

from .rag_vector_db import RAGVectorDB

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    Processes documents for RAG system
    Handles PDF, DOCX, and TXT files
    """

    def __init__(self):
        self.vector_db = RAGVectorDB()
        self.docs_path = os.getenv("RAG_DOCS_PATH", "./data/documents")
        self.chunk_size = int(os.getenv("RAG_CHUNK_SIZE", "500"))
        self.chunk_overlap = int(os.getenv("RAG_CHUNK_OVERLAP", "50"))
        
        # Create docs path if not exists
        Path(self.docs_path).mkdir(parents=True, exist_ok=True)

    def load_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            
            logger.info(f"PDF loaded: {file_path}")
            return text

        except Exception as e:
            logger.error(f"Error loading PDF: {str(e)}")
            raise

    def load_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = DocxDocument(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            
            logger.info(f"DOCX loaded: {file_path}")
            return text

        except Exception as e:
            logger.error(f"Error loading DOCX: {str(e)}")
            raise

    def load_txt(self, file_path: str) -> str:
        """Load text file"""
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                text = file.read()
            
            logger.info(f"TXT loaded: {file_path}")
            return text

        except Exception as e:
            logger.error(f"Error loading TXT: {str(e)}")
            raise

    def load_document(self, file_path: str) -> str:
        """Load document based on file extension"""
        ext = Path(file_path).suffix.lower()

        if ext == ".pdf":
            return self.load_pdf(file_path)
        elif ext == ".docx":
            return self.load_docx(file_path)
        elif ext == ".txt":
            return self.load_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def chunk_text(self, text: str, chunk_size: Optional[int] = None, overlap: Optional[int] = None) -> List[str]:
        """
        Split text into chunks with optional overlap
        
        Args:
            text: Text to chunk
            chunk_size: Size of each chunk (default from env)
            overlap: Overlap between chunks (default from env)
        
        Returns:
            List of text chunks
        """
        if chunk_size is None:
            chunk_size = self.chunk_size
        if overlap is None:
            overlap = self.chunk_overlap

        chunks = []
        start = 0

        while start < len(text):
            # Find end position
            end = start + chunk_size

            # Find the last sentence boundary
            if end < len(text):
                # Look for a sentence boundary (period, newline)
                last_period = text.rfind(".", start, end)
                last_newline = text.rfind("\n", start, end)
                boundary = max(last_period, last_newline)
                
                if boundary > start:
                    end = boundary + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # Move start position with overlap
            start = end - overlap

        logger.info(f"Text chunked into {len(chunks)} chunks")
        return chunks

    def process_file(
        self,
        file_path: str,
        doc_type: str = "general",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process a single file and store in vector DB
        
        Args:
            file_path: Path to file
            doc_type: Type of document (trek_info, faq, policy, blog)
            metadata: Additional metadata
        
        Returns:
            {
                "filename": "everest.pdf",
                "chunks": 50,
                "stored": 50,
                "failed": 0,
                "doc_ids": [...]
            }
        """
        try:
            # Load document
            text = self.load_document(file_path)

            # Chunk text
            chunks = self.chunk_text(text)

            # Store chunks
            results = {
                "filename": Path(file_path).name,
                "chunks": len(chunks),
                "stored": 0,
                "failed": 0,
                "doc_ids": [],
            }

            for i, chunk in enumerate(chunks):
                doc_id = f"{doc_type}_{Path(file_path).stem}_chunk_{i}"
                
                try:
                    # Prepare metadata
                    chunk_metadata = {
                        "doc_type": doc_type,
                        "source": Path(file_path).name,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                    }
                    
                    if metadata:
                        chunk_metadata.update(metadata)

                    # Store in vector DB
                    self.vector_db.store_document(
                        doc_id=doc_id,
                        content=chunk,
                        metadata=chunk_metadata,
                    )

                    results["stored"] += 1
                    results["doc_ids"].append(doc_id)

                except Exception as e:
                    logger.error(f"Error storing chunk {i}: {str(e)}")
                    results["failed"] += 1

            logger.info(f"File processed: {results}")
            return results

        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            return {
                "filename": Path(file_path).name,
                "error": str(e),
            }

    def process_directory(self, directory: Optional[str] = None) -> Dict[str, Any]:
        """
        Process all documents in a directory
        
        Args:
            directory: Directory path (default from env)
        
        Returns:
            {
                "total_files": 5,
                "processed": 5,
                "failed": 0,
                "total_chunks": 250,
                "files": [...]
            }
        """
        if directory is None:
            directory = self.docs_path

        results = {
            "total_files": 0,
            "processed": 0,
            "failed": 0,
            "total_chunks": 0,
            "files": [],
        }

        try:
            path = Path(directory)
            files = list(path.glob("*.*"))
            results["total_files"] = len(files)

            for file_path in files:
                if file_path.suffix.lower() in [".pdf", ".docx", ".txt"]:
                    try:
                        file_result = self.process_file(str(file_path))
                        results["files"].append(file_result)
                        
                        if "error" not in file_result:
                            results["processed"] += 1
                            results["total_chunks"] += file_result.get("chunks", 0)
                        else:
                            results["failed"] += 1

                    except Exception as e:
                        logger.error(f"Error processing {file_path}: {str(e)}")
                        results["failed"] += 1
                        results["files"].append({
                            "filename": file_path.name,
                            "error": str(e),
                        })

            logger.info(f"Directory processing complete: {results}")
            return results

        except Exception as e:
            logger.error(f"Error processing directory: {str(e)}")
            return {"error": str(e)}

    def get_sample_trek_data(self) -> str:
        """
        Generate sample trek documentation for testing
        Returns a comprehensive document about Everest trek
        """
        sample_doc = """
        EVEREST BASE CAMP TREK - COMPLETE GUIDE
        
        OVERVIEW
        The Everest Base Camp Trek is one of the world's most iconic high-altitude treks. 
        This trek takes you to the base camp of Mount Everest at 5,364 meters.
        
        DURATION & ITINERARY
        The trek typically takes 12-14 days:
        - Days 1-2: Kathmandu to Lukla (acclimatization)
        - Days 3-4: Lukla to Namche Bazaar
        - Days 5-6: Namche to Tengboche (cultural experience)
        - Days 7-8: Tengboche to Dingboche (rest day for acclimatization)
        - Days 9-10: Dingboche to Everest Base Camp
        - Days 11-12: Return trek
        - Day 13: Fly back to Kathmandu
        
        BEST TIME TO TREK
        - Spring (October-November): Clear skies, best visibility, moderate temperatures
        - Autumn (May-June): Fresh snow, cooler temperatures, good for photography
        - Avoid: Monsoon season (July-September), Winter (December-February)
        
        PRICING
        - Budget Option: ₹35,000 (basic lodges, local guides)
        - Standard Option: ₹45,000 (comfortable lodges, experienced guides)
        - Premium Option: ₹65,000 (luxury accommodation, personal porter)
        
        HEALTH & SAFETY
        - Altitude sickness is common above 3,500m
        - Acclimatization rest days are essential
        - Professional medical guides included
        - Emergency helicopter evacuation insurance provided
        
        WHAT'S INCLUDED
        - Round-trip flights Kathmandu-Lukla
        - All accommodation in teahouses
        - All meals (breakfast, lunch, dinner)
        - Professional English-speaking guide
        - Porter for baggage
        - Comprehensive trekking equipment
        
        FREQUENTLY ASKED QUESTIONS
        Q: Is it difficult?
        A: Moderate to challenging due to altitude. Not technical climbing.
        
        Q: What's the success rate?
        A: 95% reach base camp with proper acclimatization.
        
        Q: Do I need previous trekking experience?
        A: No, but good fitness level recommended.
        
        Q: What about altitude sickness?
        A: Our guides monitor you daily. We have medication and evacuation plan.
        
        Q: Can I do it solo?
        A: Yes, but guides recommended for safety and experience.
        
        SPECIAL OFFERS
        - Early bird discount: 15% off for bookings 60+ days in advance
        - Group discount: 20% off for groups of 5+
        - Repeat trekker discount: 10% off
        """
        
        return sample_doc

    def initialize_sample_data(self) -> bool:
        """Initialize system with sample trek data"""
        try:
            sample_file = os.path.join(self.docs_path, "everest_trek.txt")
            
            # Write sample data
            with open(sample_file, "w", encoding="utf-8") as f:
                f.write(self.get_sample_trek_data())
            
            logger.info(f"Sample data written to: {sample_file}")

            # Process the file
            result = self.process_file(
                sample_file,
                doc_type="trek_info",
                metadata={"trek_name": "Everest Base Camp", "region": "Nepal"}
            )

            logger.info(f"Sample data processed: {result}")
            return result.get("stored", 0) > 0

        except Exception as e:
            logger.error(f"Error initializing sample data: {str(e)}")
            return False
