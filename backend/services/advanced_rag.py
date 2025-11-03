"""
Advanced RAG Service - Phase 6
Enhanced Retrieval-Augmented Generation with advanced features:
- Multi-strategy embeddings
- Semantic search optimization
- Performance enhancements
- Content enrichment
- Advanced retrieval algorithms
"""

import os
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import json
import re

from .rag_vector_db import RAGVectorDB
from .rag_retriever import RAGRetriever
from .rag_document_processor import DocumentProcessor

logger = logging.getLogger(__name__)


@dataclass
class RetrievalResult:
    """Enhanced retrieval result with metadata"""
    doc_id: str
    content: str
    score: float
    metadata: Dict[str, Any]
    embedding_strategy: str
    retrieval_method: str
    timestamp: datetime
    context_window: Optional[str] = None


@dataclass
class QueryAnalysis:
    """Query analysis for optimized retrieval"""
    query: str
    intent: str
    entities: List[str]
    keywords: List[str]
    query_type: str  # factual, conversational, comparative, etc.
    complexity: str  # simple, moderate, complex
    domains: List[str]  # trek_info, pricing, faq, policy, etc.


class AdvancedEmbeddingEngine:
    """Multi-strategy embedding engine"""

    def __init__(self):
        self.vector_db = RAGVectorDB()
        self.embedding_strategies = {
            "standard": self._standard_embedding,
            "contextual": self._contextual_embedding,
            "hierarchical": self._hierarchical_embedding,
            "multi_modal": self._multi_modal_embedding,
        }
        self.executor = ThreadPoolExecutor(max_workers=4)

    def _standard_embedding(self, text: str) -> List[float]:
        """Standard single embedding"""
        return self.vector_db.generate_embedding(text)

    def _contextual_embedding(self, text: str) -> List[float]:
        """Context-aware embedding with surrounding context"""
        # Add context window for better semantic understanding
        context_window = 200
        if len(text) < context_window:
            return self._standard_embedding(text)

        # For now, use standard embedding (can be enhanced with sentence transformers)
        return self._standard_embedding(text)

    def _hierarchical_embedding(self, text: str) -> List[float]:
        """Hierarchical embedding (document + chunk level)"""
        # Create embeddings at different granularities
        sentences = re.split(r'[.!?]+', text)
        sentence_embeddings = []

        for sentence in sentences[:5]:  # First 5 sentences
            if sentence.strip():
                sentence_embeddings.append(self._standard_embedding(sentence.strip()))

        if sentence_embeddings:
            # Average embeddings for hierarchical representation
            return np.mean(sentence_embeddings, axis=0).tolist()

        return self._standard_embedding(text)

    def _multi_modal_embedding(self, text: str) -> List[float]:
        """Multi-modal embedding (text + metadata features)"""
        # Enhanced embedding considering metadata features
        base_embedding = self._standard_embedding(text)

        # Add metadata features (can be expanded)
        # For now, return base embedding
        return base_embedding

    async def generate_embeddings_async(
        self,
        texts: List[str],
        strategy: str = "standard"
    ) -> List[List[float]]:
        """Generate embeddings asynchronously"""
        if strategy not in self.embedding_strategies:
            strategy = "standard"

        embed_func = self.embedding_strategies[strategy]

        loop = asyncio.get_event_loop()
        tasks = []

        for text in texts:
            task = loop.run_in_executor(self.executor, embed_func, text)
            tasks.append(task)

        return await asyncio.gather(*tasks)

    def generate_embedding_with_strategy(
        self,
        text: str,
        strategy: str = "standard"
    ) -> Tuple[List[float], str]:
        """Generate embedding with specified strategy"""
        if strategy not in self.embedding_strategies:
            strategy = "standard"

        embed_func = self.embedding_strategies[strategy]
        embedding = embed_func(text)

        return embedding, strategy


class SemanticSearchEngine:
    """Advanced semantic search with multiple retrieval strategies"""

    def __init__(self):
        self.vector_db = RAGVectorDB()
        self.embedding_engine = AdvancedEmbeddingEngine()
        self.query_analyzer = QueryAnalyzer()

    def analyze_query(self, query: str) -> QueryAnalysis:
        """Analyze query for optimized retrieval"""
        return self.query_analyzer.analyze(query)

    async def multi_strategy_search(
        self,
        query: str,
        top_k: int = 5,
        strategies: Optional[List[str]] = None
    ) -> List[RetrievalResult]:
        """Search using multiple embedding strategies"""
        if strategies is None:
            strategies = ["standard", "contextual"]

        all_results = []

        # Run searches in parallel for different strategies
        for strategy in strategies:
            try:
                embedding, strategy_name = self.embedding_engine.generate_embedding_with_strategy(
                    query, strategy
                )

                # Search with this embedding
                results = self.vector_db.search(query, top_k=top_k)

                for doc_id, score, metadata in results:
                    result = RetrievalResult(
                        doc_id=doc_id,
                        content=metadata.get("content", ""),
                        score=score,
                        metadata=metadata,
                        embedding_strategy=strategy_name,
                        retrieval_method="vector_search",
                        timestamp=datetime.now()
                    )
                    all_results.append(result)

            except Exception as e:
                logger.error(f"Error in {strategy} search: {e}")

        # Rerank and deduplicate results
        return self._rerank_and_deduplicate(all_results, top_k)

    async def hybrid_search(
        self,
        query: str,
        top_k: int = 5,
        use_semantic: bool = True,
        use_keyword: bool = True
    ) -> List[RetrievalResult]:
        """Hybrid search combining semantic and keyword-based retrieval"""
        results = []

        if use_semantic:
            # Semantic search
            semantic_results = await self.multi_strategy_search(query, top_k=top_k)
            results.extend(semantic_results)

        if use_keyword:
            # Keyword-based search (can be implemented with text search)
            keyword_results = self._keyword_search(query, top_k=top_k)
            results.extend(keyword_results)

        return self._rerank_and_deduplicate(results, top_k)

    def _keyword_search(self, query: str, top_k: int) -> List[RetrievalResult]:
        """Simple keyword-based search (placeholder for full-text search)"""
        # This would integrate with a full-text search engine
        # For now, return empty list
        return []

    def _rerank_and_deduplicate(
        self,
        results: List[RetrievalResult],
        top_k: int
    ) -> List[RetrievalResult]:
        """Rerank and remove duplicates"""
        # Remove duplicates based on doc_id
        seen_docs = set()
        unique_results = []

        for result in results:
            if result.doc_id not in seen_docs:
                unique_results.append(result)
                seen_docs.add(result.doc_id)

        # Rerank by score
        unique_results.sort(key=lambda x: x.score, reverse=True)

        return unique_results[:top_k]


class QueryAnalyzer:
    """Advanced query analysis for optimization"""

    def __init__(self):
        self.intent_patterns = {
            "booking": ["book", "reserve", "schedule", "plan"],
            "pricing": ["cost", "price", "fee", "budget", "expensive"],
            "information": ["tell me about", "what is", "how to", "guide"],
            "comparison": ["vs", "versus", "compare", "difference", "better"],
        }

        self.domain_keywords = {
            "trek_info": ["everest", "manali", "goa", "kashmir", "trek", "hike"],
            "pricing": ["cost", "price", "budget", "fee", "expensive", "cheap"],
            "faq": ["how", "what", "when", "where", "why", "can i"],
            "policy": ["cancel", "refund", "safety", "insurance", "terms"],
        }

    def analyze(self, query: str) -> QueryAnalysis:
        """Analyze query for intent, entities, and optimization hints"""
        query_lower = query.lower()

        # Detect intent
        intent = self._detect_intent(query_lower)

        # Extract entities (trek names, locations, etc.)
        entities = self._extract_entities(query_lower)

        # Extract keywords
        keywords = self._extract_keywords(query_lower)

        # Determine query type
        query_type = self._classify_query_type(query_lower)

        # Assess complexity
        complexity = self._assess_complexity(query_lower, entities, keywords)

        # Identify relevant domains
        domains = self._identify_domains(query_lower)

        return QueryAnalysis(
            query=query,
            intent=intent,
            entities=entities,
            keywords=keywords,
            query_type=query_type,
            complexity=complexity,
            domains=domains
        )

    def _detect_intent(self, query: str) -> str:
        """Detect user intent"""
        for intent, patterns in self.intent_patterns.items():
            if any(pattern in query for pattern in patterns):
                return intent
        return "information"

    def _extract_entities(self, query: str) -> List[str]:
        """Extract named entities"""
        entities = []

        # Trek names and locations
        trek_locations = ["everest", "manali", "goa", "kashmir", "ladakh", "himachal", "uttarakhand"]
        for location in trek_locations:
            if location in query:
                entities.append(location)

        return entities

    def _extract_keywords(self, query: str) -> List[str]:
        """Extract important keywords"""
        # Remove stop words and get meaningful terms
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        words = query.split()
        keywords = [word for word in words if word not in stop_words and len(word) > 2]

        return keywords[:10]  # Limit to top 10

    def _classify_query_type(self, query: str) -> str:
        """Classify query type"""
        if any(word in query for word in ["compare", "vs", "versus", "difference", "better"]):
            return "comparative"
        elif any(word in query for word in ["how", "what", "when", "where", "why"]):
            return "factual"
        elif any(word in query for word in ["recommend", "suggest", "should i"]):
            return "recommendation"
        else:
            return "conversational"

    def _assess_complexity(self, query: str, entities: List[str], keywords: List[str]) -> str:
        """Assess query complexity"""
        complexity_score = 0

        # Length factor
        if len(query.split()) > 10:
            complexity_score += 1

        # Multiple entities
        if len(entities) > 1:
            complexity_score += 1

        # Multiple keywords
        if len(keywords) > 5:
            complexity_score += 1

        # Comparative queries are more complex
        if "comparative" in self._classify_query_type(query):
            complexity_score += 1

        if complexity_score >= 3:
            return "complex"
        elif complexity_score >= 2:
            return "moderate"
        else:
            return "simple"

    def _identify_domains(self, query: str) -> List[str]:
        """Identify relevant knowledge domains"""
        domains = []

        for domain, keywords in self.domain_keywords.items():
            if any(keyword in query for keyword in keywords):
                domains.append(domain)

        return domains or ["general"]


class PerformanceOptimizer:
    """Performance optimization for RAG operations"""

    def __init__(self):
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)
        self.query_stats = defaultdict(int)
        self.performance_metrics = {}

    def cache_retrieval_result(self, query: str, results: List[RetrievalResult]):
        """Cache retrieval results"""
        self.cache[query] = {
            "results": results,
            "timestamp": datetime.now()
        }

    def get_cached_result(self, query: str) -> Optional[List[RetrievalResult]]:
        """Get cached result if still valid"""
        if query in self.cache:
            cached = self.cache[query]
            if datetime.now() - cached["timestamp"] < self.cache_ttl:
                return cached["results"]
            else:
                # Remove expired cache
                del self.cache[query]

        return None

    def optimize_query(self, query: str, analysis: QueryAnalysis) -> str:
        """Optimize query for better retrieval"""
        # Based on analysis, enhance query
        optimized_parts = [query]

        # Add domain-specific terms
        if analysis.domains and analysis.domains != ["general"]:
            domain_terms = {
                "trek_info": "trek information details",
                "pricing": "cost price budget",
                "faq": "frequently asked questions",
                "policy": "rules terms conditions"
            }

            for domain in analysis.domains:
                if domain in domain_terms:
                    optimized_parts.append(domain_terms[domain])

        # Add entity context
        if analysis.entities:
            entity_context = " ".join(analysis.entities)
            optimized_parts.append(entity_context)

        return " ".join(optimized_parts)

    def track_performance(self, operation: str, duration: float, success: bool):
        """Track performance metrics"""
        if operation not in self.performance_metrics:
            self.performance_metrics[operation] = {
                "calls": 0,
                "total_time": 0,
                "successes": 0,
                "failures": 0
            }

        metrics = self.performance_metrics[operation]
        metrics["calls"] += 1
        metrics["total_time"] += duration

        if success:
            metrics["successes"] += 1
        else:
            metrics["failures"] += 1

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        stats = {}

        for operation, metrics in self.performance_metrics.items():
            stats[operation] = {
                "total_calls": metrics["calls"],
                "avg_response_time": metrics["total_time"] / metrics["calls"] if metrics["calls"] > 0 else 0,
                "success_rate": metrics["successes"] / metrics["calls"] if metrics["calls"] > 0 else 0,
                "failure_rate": metrics["failures"] / metrics["calls"] if metrics["calls"] > 0 else 0
            }

        return stats


class ContentEnrichmentEngine:
    """Content enrichment and enhancement"""

    def __init__(self):
        self.enrichment_strategies = {
            "context_expansion": self._expand_context,
            "related_content": self._add_related_content,
            "metadata_enhancement": self._enhance_metadata,
            "quality_scoring": self._score_content_quality
        }

    def _expand_context(self, content: str, metadata: Dict[str, Any]) -> str:
        """Expand content with additional context"""
        # Add contextual information based on metadata
        expanded = content

        if metadata.get("doc_type") == "trek_info":
            trek_name = metadata.get("trek_name", "")
            if trek_name:
                expanded = f"Trek Information for {trek_name}:\n\n{content}"

        return expanded

    def _add_related_content(self, content: str, metadata: Dict[str, Any]) -> str:
        """Add related content links/references"""
        # This would add links to related documents
        # For now, return original content
        return content

    def _enhance_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance metadata with additional information"""
        enhanced = metadata.copy()

        # Add content quality score
        enhanced["quality_score"] = self._calculate_quality_score(metadata)

        # Add last_updated timestamp
        enhanced["last_enriched"] = datetime.now().isoformat()

        return enhanced

    def _score_content_quality(self, metadata: Dict[str, Any]) -> float:
        """Score content quality based on various factors"""
        score = 0.5  # Base score

        # Length factor
        content_length = len(metadata.get("content", ""))
        if content_length > 1000:
            score += 0.2
        elif content_length > 500:
            score += 0.1

        # Metadata completeness
        if metadata.get("doc_type"):
            score += 0.1
        if metadata.get("source"):
            score += 0.1
        if metadata.get("trek_name"):
            score += 0.1

        return min(score, 1.0)

    def _calculate_quality_score(self, metadata: Dict[str, Any]) -> float:
        """Calculate overall quality score"""
        return self._score_content_quality(metadata)

    def enrich_content(
        self,
        content: str,
        metadata: Dict[str, Any],
        strategies: Optional[List[str]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Apply enrichment strategies to content"""
        if strategies is None:
            strategies = ["context_expansion", "metadata_enhancement"]

        enriched_content = content
        enriched_metadata = metadata.copy()

        for strategy in strategies:
            if strategy in self.enrichment_strategies:
                if strategy == "context_expansion":
                    enriched_content = self.enrichment_strategies[strategy](enriched_content, enriched_metadata)
                elif strategy == "metadata_enhancement":
                    enriched_metadata = self.enrichment_strategies[strategy](enriched_metadata)

        return enriched_content, enriched_metadata


class AdvancedRAGService:
    """Main Advanced RAG Service"""

    def __init__(self):
        self.vector_db = RAGVectorDB()
        self.document_processor = DocumentProcessor()
        self.embedding_engine = AdvancedEmbeddingEngine()
        self.search_engine = SemanticSearchEngine()
        self.performance_optimizer = PerformanceOptimizer()
        self.content_enricher = ContentEnrichmentEngine()

        # Initialize components
        self._initialize_components()

    def _initialize_components(self):
        """Initialize all RAG components"""
        logger.info("Initializing Advanced RAG Service components")

        # Initialize sample data if needed
        stats = self.vector_db.get_document_stats()
        if stats.get("total_vectors", 0) == 0:
            logger.info("No documents found, initializing sample data")
            self.document_processor.initialize_sample_data()

    async def advanced_retrieve(
        self,
        query: str,
        top_k: int = 5,
        use_cache: bool = True,
        optimize_query: bool = True,
        enrich_content: bool = True
    ) -> Dict[str, Any]:
        """Advanced retrieval with all optimizations"""
        start_time = datetime.now()

        try:
            # Check cache first
            if use_cache:
                cached_result = self.performance_optimizer.get_cached_result(query)
                if cached_result:
                    return {
                        "query": query,
                        "results": [asdict(result) for result in cached_result],
                        "cached": True,
                        "processing_time": (datetime.now() - start_time).total_seconds()
                    }

            # Analyze query
            analysis = self.search_engine.analyze_query(query)

            # Optimize query if requested
            search_query = query
            if optimize_query:
                search_query = self.performance_optimizer.optimize_query(query, analysis)

            # Perform hybrid search
            results = await self.search_engine.hybrid_search(search_query, top_k=top_k)

            # Enrich content if requested
            if enrich_content:
                enriched_results = []
                for result in results:
                    enriched_content, enriched_metadata = self.content_enricher.enrich_content(
                        result.content, result.metadata
                    )
                    result.content = enriched_content
                    result.metadata = enriched_metadata
                    enriched_results.append(result)
                results = enriched_results

            # Cache results
            if use_cache:
                self.performance_optimizer.cache_retrieval_result(query, results)

            # Track performance
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_optimizer.track_performance("advanced_retrieve", processing_time, True)

            return {
                "query": query,
                "optimized_query": search_query,
                "analysis": asdict(analysis),
                "results": [asdict(result) for result in results],
                "total_results": len(results),
                "cached": False,
                "processing_time": processing_time
            }

        except Exception as e:
            logger.error(f"Error in advanced retrieval: {e}")
            processing_time = (datetime.now() - start_time).total_seconds()
            self.performance_optimizer.track_performance("advanced_retrieve", processing_time, False)

            return {
                "query": query,
                "error": str(e),
                "processing_time": processing_time
            }

    async def retrieve_with_context(
        self,
        query: str,
        context_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """Retrieve with contextual information"""
        analysis = self.search_engine.analyze_query(query)

        # Get main results
        main_results = await self.advanced_retrieve(query, top_k=5)

        context = {
            "main_results": main_results,
            "query_analysis": asdict(analysis)
        }

        # Add contextual information based on type
        if context_type == "comprehensive":
            # Add related queries, alternative phrasings, etc.
            context["related_queries"] = self._generate_related_queries(query, analysis)
            context["confidence_score"] = self._calculate_confidence(main_results)

        return context

    def _generate_related_queries(self, query: str, analysis: QueryAnalysis) -> List[str]:
        """Generate related queries for better coverage"""
        related = []

        # Add entity-focused queries
        for entity in analysis.entities:
            related.append(f"{entity} trek information")
            related.append(f"{entity} pricing")

        # Add domain-specific queries
        for domain in analysis.domains:
            if domain == "pricing":
                related.append("cost comparison")
            elif domain == "faq":
                related.append("common questions")

        return related[:5]  # Limit to 5

    def _calculate_confidence(self, results: Dict[str, Any]) -> float:
        """Calculate confidence score for results"""
        if "error" in results:
            return 0.0

        result_list = results.get("results", [])
        if not result_list:
            return 0.0

        # Average score of top results
        scores = [r.get("score", 0) for r in result_list[:3]]
        avg_score = sum(scores) / len(scores) if scores else 0

        # Factor in number of results
        result_factor = min(len(result_list) / 5, 1.0)  # Max at 5 results

        return (avg_score * 0.7) + (result_factor * 0.3)

    async def batch_retrieve(
        self,
        queries: List[str],
        batch_size: int = 5
    ) -> List[Dict[str, Any]]:
        """Batch retrieve for multiple queries"""
        results = []

        # Process in batches to avoid overwhelming the system
        for i in range(0, len(queries), batch_size):
            batch = queries[i:i + batch_size]

            batch_tasks = []
            for query in batch:
                task = self.advanced_retrieve(query, top_k=3)
                batch_tasks.append(task)

            batch_results = await asyncio.gather(*batch_tasks)
            results.extend(batch_results)

            # Small delay between batches
            if i + batch_size < len(queries):
                await asyncio.sleep(0.1)

        return results

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        return self.performance_optimizer.get_performance_stats()

    def get_system_stats(self) -> Dict[str, Any]:
        """Get overall system statistics"""
        vector_stats = self.vector_db.get_document_stats()
        perf_stats = self.get_performance_stats()

        return {
            "vector_database": vector_stats,
            "performance": perf_stats,
            "components": {
                "embedding_strategies": list(self.embedding_engine.embedding_strategies.keys()),
                "search_strategies": ["multi_strategy", "hybrid"],
                "enrichment_strategies": list(self.content_enricher.enrichment_strategies.keys())
            }
        }

    async def optimize_index(self):
        """Optimize the vector index for better performance"""
        # This would implement index optimization strategies
        # For now, just log
        logger.info("Running index optimization")
        # Could include: index compaction, cache warming, etc.

    async def health_check(self) -> Dict[str, Any]:
        """Health check for the RAG service"""
        health = {
            "status": "healthy",
            "components": {},
            "timestamp": datetime.now().isoformat()
        }

        try:
            # Check vector database
            vector_stats = self.vector_db.get_document_stats()
            health["components"]["vector_db"] = {
                "status": "healthy" if vector_stats else "error",
                "documents": vector_stats.get("total_vectors", 0)
            }

            # Check embedding engine
            test_embedding = await self.embedding_engine.generate_embeddings_async(["test"], "standard")
            health["components"]["embedding_engine"] = {
                "status": "healthy" if test_embedding else "error"
            }

            # Check search engine
            test_search = await self.search_engine.multi_strategy_search("test query", top_k=1)
            health["components"]["search_engine"] = {
                "status": "healthy",
                "results_found": len(test_search)
            }

        except Exception as e:
            health["status"] = "unhealthy"
            health["error"] = str(e)

        return health


# Singleton instance
_advanced_rag_service = None

def get_advanced_rag_service() -> AdvancedRAGService:
    """Get singleton instance of advanced RAG service"""
    global _advanced_rag_service
    if _advanced_rag_service is None:
        _advanced_rag_service = AdvancedRAGService()
    return _advanced_rag_service