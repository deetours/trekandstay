"""
RAG Vector Database Service
Manages Pinecone integration for document embeddings and retrieval
"""

import os
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from pinecone import Pinecone
from openai import OpenAI
import json

logger = logging.getLogger(__name__)


class RAGVectorDB:
    """
    Vector Database management for RAG
    Uses Pinecone for scalable vector storage
    """

    def __init__(self):
        self.db_type = os.getenv("RAG_VECTOR_DB_TYPE", "pinecone")
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        
        if self.db_type == "pinecone":
            self._init_pinecone()
        else:
            self._init_local()

    def _init_pinecone(self):
        """Initialize Pinecone connection"""
        try:
            api_key = os.getenv("PINECONE_API_KEY")
            index_name = os.getenv("PINECONE_INDEX_NAME", "trek-and-stay-rag")
            environment = os.getenv("PINECONE_ENVIRONMENT", "us-west-2-aws")

            # Initialize Pinecone
            self.pc = Pinecone(api_key=api_key)
            
            # Get or create index
            if index_name not in self.pc.list_indexes().names():
                logger.info(f"Creating Pinecone index: {index_name}")
                self.pc.create_index(
                    name=index_name,
                    dimension=int(os.getenv("EMBEDDING_DIMENSION", "1536")),
                    metric="cosine",
                )
            
            self.index = self.pc.Index(index_name)
            self.openai_client = OpenAI()
            logger.info(f"Pinecone initialized: {index_name}")

        except Exception as e:
            logger.error(f"Pinecone initialization error: {str(e)}")
            raise

    def _init_local(self):
        """Initialize local vector storage (for testing)"""
        logger.warning("Using local vector storage (for development only)")
        self.local_vectors = {}
        self.local_docs = {}

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using OpenAI
        
        Args:
            text: Text to embed
        
        Returns:
            List of floats representing the embedding
        """
        try:
            if self.db_type != "pinecone":
                # For local testing, use a simple hash-based embedding
                import hashlib
                hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16) % 10000
                return [float(hash_val % 100) / 100 for _ in range(1536)]

            response = self.openai_client.embeddings.create(
                input=text,
                model=self.embedding_model
            )
            
            return response.data[0].embedding

        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise

    def store_document(
        self,
        doc_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Store document with embeddings in vector DB
        
        Args:
            doc_id: Unique document ID
            content: Document text content
            metadata: Additional metadata (title, source, etc)
        
        Returns:
            True if successful
        """
        try:
            # Generate embedding
            embedding = self.generate_embedding(content)

            if self.db_type == "pinecone":
                # Store in Pinecone
                self.index.upsert(
                    vectors=[
                        (
                            doc_id,
                            embedding,
                            metadata or {"content": content[:500]},
                        )
                    ]
                )
            else:
                # Store locally
                self.local_vectors[doc_id] = embedding
                self.local_docs[doc_id] = {"content": content, "metadata": metadata}

            logger.info(f"Document stored: {doc_id}")
            return True

        except Exception as e:
            logger.error(f"Error storing document: {str(e)}")
            return False

    def search(
        self,
        query: str,
        top_k: int = 5,
        metadata_filter: Optional[Dict] = None,
    ) -> List[Tuple[str, float, Dict]]:
        """
        Search for similar documents
        
        Args:
            query: Search query text
            top_k: Number of results to return
            metadata_filter: Optional metadata filter
        
        Returns:
            List of (doc_id, similarity_score, metadata)
        """
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)

            if self.db_type == "pinecone":
                # Search in Pinecone
                results = self.index.query(
                    vector=query_embedding,
                    top_k=top_k,
                    include_metadata=True,
                    filter=metadata_filter,
                )

                return [
                    (
                        match.id,
                        match.score,
                        match.metadata,
                    )
                    for match in results.matches
                ]
            else:
                # Search locally
                similarities = []
                for doc_id, vec in self.local_vectors.items():
                    # Cosine similarity
                    similarity = np.dot(query_embedding, vec) / (
                        np.linalg.norm(query_embedding) * np.linalg.norm(vec)
                    )
                    similarities.append((doc_id, similarity, self.local_docs[doc_id]["metadata"]))

                # Sort and return top-k
                similarities.sort(key=lambda x: x[1], reverse=True)
                return similarities[:top_k]

        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []

    def delete_document(self, doc_id: str) -> bool:
        """Delete document from vector DB"""
        try:
            if self.db_type == "pinecone":
                self.index.delete(ids=[doc_id])
            else:
                if doc_id in self.local_vectors:
                    del self.local_vectors[doc_id]
                    del self.local_docs[doc_id]

            logger.info(f"Document deleted: {doc_id}")
            return True

        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return False

    def get_document_stats(self) -> Dict[str, Any]:
        """Get statistics about stored documents"""
        try:
            if self.db_type == "pinecone":
                stats = self.index.describe_index_stats()
                return {
                    "total_vectors": stats.total_vector_count,
                    "namespaces": stats.namespaces,
                    "dimension": stats.dimension,
                }
            else:
                return {
                    "total_vectors": len(self.local_vectors),
                    "namespaces": {"default": len(self.local_vectors)},
                    "dimension": 1536,
                }

        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}")
            return {"error": str(e)}

    def clear_all(self) -> bool:
        """Clear all documents (use with caution!)"""
        try:
            if self.db_type == "pinecone":
                self.index.delete(delete_all=True)
            else:
                self.local_vectors.clear()
                self.local_docs.clear()

            logger.warning("All documents cleared from vector DB")
            return True

        except Exception as e:
            logger.error(f"Error clearing database: {str(e)}")
            return False

    def batch_store_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Store multiple documents at once
        
        Args:
            documents: List of {id, content, metadata}
        
        Returns:
            {
                "total": 100,
                "successful": 98,
                "failed": 2,
                "errors": []
            }
        """
        results = {"total": len(documents), "successful": 0, "failed": 0, "errors": []}

        for doc in documents:
            try:
                self.store_document(
                    doc_id=doc.get("id"),
                    content=doc.get("content"),
                    metadata=doc.get("metadata"),
                )
                results["successful"] += 1
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({"doc_id": doc.get("id"), "error": str(e)})

        logger.info(f"Batch store complete: {results['successful']}/{results['total']} successful")
        return results
