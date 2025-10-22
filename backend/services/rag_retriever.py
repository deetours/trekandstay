"""
RAG Retriever Service
Retrieves relevant documents from vector database for context injection
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from .rag_vector_db import RAGVectorDB

logger = logging.getLogger(__name__)


class RAGRetriever:
    """
    Retrieves documents from RAG vector database
    Formats context for LLM use
    """

    def __init__(self):
        self.vector_db = RAGVectorDB()
        self.top_k = int(__import__("os").getenv("RAG_RETRIEVAL_TOP_K", "5"))

    def retrieve_relevant_docs(
        self,
        query: str,
        top_k: Optional[int] = None,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[Tuple[str, float, Dict]]:
        """
        Retrieve relevant documents for query
        
        Args:
            query: Search query
            top_k: Number of documents to retrieve
            metadata_filter: Optional metadata filter
        
        Returns:
            List of (doc_id, similarity_score, metadata)
        """
        if top_k is None:
            top_k = self.top_k

        try:
            results = self.vector_db.search(
                query=query,
                top_k=top_k,
                metadata_filter=metadata_filter,
            )

            logger.info(f"Retrieved {len(results)} documents for query: {query[:50]}")
            return results

        except Exception as e:
            logger.error(f"Error retrieving documents: {str(e)}")
            return []

    def rerank_documents(
        self,
        query: str,
        documents: List[Tuple[str, float, Dict]],
    ) -> List[Tuple[str, float, Dict]]:
        """
        Rerank documents based on relevance
        Uses BM25-like algorithm for better relevance
        
        Args:
            query: Original query
            documents: Retrieved documents with scores
        
        Returns:
            Reranked documents
        """
        if not documents:
            return []

        try:
            # Simple reranking: boost score based on query term frequency in metadata
            query_terms = set(query.lower().split())
            reranked = []

            for doc_id, score, metadata in documents:
                boost = 0
                
                # Boost if trek name matches
                if "trek_name" in metadata:
                    trek_name = str(metadata.get("trek_name", "")).lower()
                    boost += sum(1 for term in query_terms if term in trek_name)

                # Boost if doc_type matches intent
                doc_type = str(metadata.get("doc_type", "")).lower()
                if "price" in query.lower() and "pricing" in doc_type:
                    boost += 0.5
                elif "faq" in doc_type and "question" in query.lower():
                    boost += 0.5

                # Recalculate score with boost
                new_score = min(score + (boost * 0.1), 1.0)
                reranked.append((doc_id, new_score, metadata))

            # Sort by new score
            reranked.sort(key=lambda x: x[1], reverse=True)
            
            logger.info(f"Reranked {len(reranked)} documents")
            return reranked

        except Exception as e:
            logger.error(f"Error reranking documents: {str(e)}")
            return documents

    def format_context(
        self,
        documents: List[Tuple[str, float, Dict]],
        include_scores: bool = False,
    ) -> str:
        """
        Format retrieved documents as context for LLM
        
        Args:
            documents: Retrieved documents
            include_scores: Whether to include similarity scores
        
        Returns:
            Formatted context string
        """
        if not documents:
            return "No relevant documents found."

        try:
            context_parts = []

            for i, (doc_id, score, metadata) in enumerate(documents, 1):
                # Extract content from metadata or fetch it
                content = metadata.get("content", metadata.get("text", ""))
                
                if not content:
                    # Try to fetch from database
                    continue

                # Format section
                section = f"Document {i}: {metadata.get('source', 'Unknown Source')}"
                if include_scores:
                    section += f" (Relevance: {score:.2%})"
                
                context_parts.append(f"--- {section} ---")
                context_parts.append(content[:500] + "..." if len(content) > 500 else content)
                context_parts.append("")

            formatted_context = "\n".join(context_parts)
            logger.info(f"Formatted context from {len(documents)} documents")
            
            return formatted_context or "No content available from retrieved documents."

        except Exception as e:
            logger.error(f"Error formatting context: {str(e)}")
            return "Error formatting context."

    def get_trek_info(self, trek_name: str) -> str:
        """
        Get all information about a specific trek
        
        Args:
            trek_name: Name of trek (Everest, Manali, etc)
        
        Returns:
            Formatted trek information
        """
        try:
            metadata_filter = {"trek_name": trek_name}
            
            docs = self.retrieve_relevant_docs(
                query=f"{trek_name} trek overview details",
                metadata_filter=metadata_filter,
            )

            if not docs:
                return f"No information found for {trek_name} trek."

            return self.format_context(docs, include_scores=False)

        except Exception as e:
            logger.error(f"Error getting trek info: {str(e)}")
            return f"Error retrieving trek information: {str(e)}"

    def get_pricing_info(self, trek_name: str, budget_range: Optional[str] = None) -> str:
        """
        Get pricing information for a trek
        
        Args:
            trek_name: Trek name
            budget_range: Optional budget range (e.g., "₹30-40k")
        
        Returns:
            Pricing information
        """
        try:
            query = f"{trek_name} pricing cost budget {budget_range or ''}"
            metadata_filter = {"doc_type": "pricing", "trek_name": trek_name}
            
            docs = self.retrieve_relevant_docs(
                query=query,
                metadata_filter=metadata_filter,
            )

            if not docs:
                # Fallback to general trek info
                docs = self.retrieve_relevant_docs(f"{trek_name} price cost")

            return self.format_context(docs, include_scores=False)

        except Exception as e:
            logger.error(f"Error getting pricing info: {str(e)}")
            return f"Error retrieving pricing information: {str(e)}"

    def get_faq_answer(self, question: str) -> str:
        """
        Get FAQ answer for a question
        
        Args:
            question: Customer question
        
        Returns:
            FAQ answer
        """
        try:
            metadata_filter = {"doc_type": "faq"}
            
            docs = self.retrieve_relevant_docs(
                query=question,
                metadata_filter=metadata_filter,
                top_k=3,
            )

            if not docs:
                return "No FAQ answer found for this question."

            return self.format_context(docs, include_scores=False)

        except Exception as e:
            logger.error(f"Error getting FAQ: {str(e)}")
            return f"Error retrieving FAQ: {str(e)}"

    def get_policy_info(self, topic: str) -> str:
        """
        Get policy information
        
        Args:
            topic: Policy topic (cancellation, safety, equipment, etc)
        
        Returns:
            Policy information
        """
        try:
            metadata_filter = {"doc_type": "policy"}
            
            docs = self.retrieve_relevant_docs(
                query=f"{topic} policy rules terms",
                metadata_filter=metadata_filter,
            )

            if not docs:
                return f"No policy information found for: {topic}"

            return self.format_context(docs, include_scores=False)

        except Exception as e:
            logger.error(f"Error getting policy: {str(e)}")
            return f"Error retrieving policy: {str(e)}"

    def retrieve_with_reranking(
        self,
        query: str,
        top_k: Optional[int] = None,
        use_reranking: bool = True,
    ) -> List[Tuple[str, float, Dict]]:
        """
        Retrieve documents with optional reranking
        
        Args:
            query: Search query
            top_k: Number of results
            use_reranking: Whether to apply reranking
        
        Returns:
            Retrieved and optionally reranked documents
        """
        try:
            docs = self.retrieve_relevant_docs(query, top_k)

            if use_reranking:
                docs = self.rerank_documents(query, docs)

            return docs

        except Exception as e:
            logger.error(f"Error in retrieve with reranking: {str(e)}")
            return []

    def get_comprehensive_context(
        self,
        query: str,
        trek_name: Optional[str] = None,
        include_faq: bool = True,
        include_policy: bool = True,
    ) -> Dict[str, str]:
        """
        Get comprehensive context for LLM response
        Combines trek info, pricing, FAQ, and policies
        
        Args:
            query: Customer query
            trek_name: Optional trek name
            include_faq: Include FAQ section
            include_policy: Include policy section
        
        Returns:
            {
                "overview": "Trek overview...",
                "pricing": "Pricing info...",
                "faq": "FAQ answers...",
                "policy": "Policy info..."
            }
        """
        context = {}

        try:
            # Get main query results
            docs = self.retrieve_with_reranking(query, top_k=5, use_reranking=True)
            context["overview"] = self.format_context(docs)

            # Get trek-specific info if trek name provided
            if trek_name:
                context["trek_info"] = self.get_trek_info(trek_name)
                context["pricing"] = self.get_pricing_info(trek_name)

            # Get FAQ
            if include_faq:
                context["faq"] = self.get_faq_answer(query)

            # Get policy
            if include_policy:
                # Infer policy topic from query
                policy_topic = self._infer_policy_topic(query)
                if policy_topic:
                    context["policy"] = self.get_policy_info(policy_topic)

            logger.info(f"Comprehensive context created with {len(context)} sections")
            return context

        except Exception as e:
            logger.error(f"Error creating comprehensive context: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def _infer_policy_topic(query: str) -> Optional[str]:
        """Infer policy topic from query"""
        query_lower = query.lower()

        policy_topics = {
            "cancel": ["cancellation", "refund", "reschedule"],
            "safe": ["safety", "security", "insurance"],
            "equip": ["equipment", "gear", "what to bring"],
            "health": ["health", "fitness", "altitude"],
        }

        for key, topics in policy_topics.items():
            if any(topic in query_lower for topic in topics):
                return topics[0]

        return None
