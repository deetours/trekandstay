"""
Phase 5 & 6 Test Suite
Comprehensive tests for Lead Nurturing & Automation and Advanced RAG features.
"""

import unittest
import asyncio
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from django.test import TestCase
from django.utils import timezone
import json

from .nurturing_automation import (
    NurturingAutomationService,
    NurturingStage,
    TaskType,
    TaskPriority,
    get_nurturing_service
)
from .advanced_rag import (
    AdvancedRAGService,
    QueryAnalysis,
    RetrievalResult,
    get_advanced_rag_service
)


class TestNurturingAutomationService(TestCase):
    """Test cases for nurturing automation service"""

    def setUp(self):
        """Set up test fixtures"""
        self.service = NurturingAutomationService()
        self.test_lead_data = {
            "phone_number": "+1234567890",
            "name": "Test User",
            "interests": ["trekking", "hiking"],
            "preferred_trek_types": ["Everest Base Camp"],
            "budget_range": "₹30-50k"
        }

    def test_create_lead_profile(self):
        """Test lead profile creation"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        self.assertIsNotNone(lead_id)
        self.assertIn(lead_id, self.service.leads)

        lead = self.service.leads[lead_id]
        self.assertEqual(lead.phone_number, self.test_lead_data["phone_number"])
        self.assertEqual(lead.name, self.test_lead_data["name"])
        self.assertEqual(lead.stage, NurturingStage.NEW_LEAD)
        self.assertEqual(lead.conversion_probability, 0.1)

    def test_update_lead_interaction_inquiry(self):
        """Test lead interaction update for inquiry"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)
        initial_probability = self.service.leads[lead_id].conversion_probability

        self.service.update_lead_interaction(lead_id, "inquiry")

        lead = self.service.leads[lead_id]
        self.assertEqual(lead.stage, NurturingStage.ENGAGED)
        self.assertGreater(lead.conversion_probability, initial_probability)

    def test_update_lead_interaction_booking_intent(self):
        """Test lead interaction update for booking intent"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        self.service.update_lead_interaction(lead_id, "booking_intent")

        lead = self.service.leads[lead_id]
        self.assertEqual(lead.stage, NurturingStage.BOOKING_INTENT)
        self.assertGreater(lead.conversion_probability, 0.8)

    def test_schedule_task(self):
        """Test task scheduling"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        task_id = self.service.schedule_task(
            lead_id=lead_id,
            task_type=TaskType.WELCOME_MESSAGE,
            priority=TaskPriority.HIGH,
            delay_hours=1,
            content={"test": "data"}
        )

        self.assertIsNotNone(task_id)
        self.assertIn(task_id, self.service.tasks)

        task = self.service.tasks[task_id]
        self.assertEqual(task.lead_id, lead_id)
        self.assertEqual(task.task_type, TaskType.WELCOME_MESSAGE)
        self.assertEqual(task.priority, TaskPriority.HIGH)

    def test_get_lead_status(self):
        """Test getting lead status"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        status = self.service.get_lead_status(lead_id)

        self.assertIsNotNone(status)
        self.assertEqual(status["lead_id"], lead_id)
        self.assertEqual(status["stage"], NurturingStage.NEW_LEAD.value)
        self.assertIn("conversion_probability", status)
        self.assertIn("pending_tasks", status)

    def test_get_pending_tasks(self):
        """Test getting pending tasks"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        # Schedule a task
        self.service.schedule_task(
            lead_id=lead_id,
            task_type=TaskType.FOLLOW_UP,
            priority=TaskPriority.MEDIUM,
            delay_hours=0,
            content={}
        )

        tasks = self.service.get_pending_tasks(lead_id)
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["lead_id"], lead_id)

    def test_complete_task(self):
        """Test task completion"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        task_id = self.service.schedule_task(
            lead_id=lead_id,
            task_type=TaskType.WELCOME_MESSAGE,
            priority=TaskPriority.HIGH,
            delay_hours=0,
            content={}
        )

        result = self.service.complete_task(task_id, "Task completed successfully")

        self.assertTrue(result["success"])
        self.assertEqual(self.service.tasks[task_id].status, "completed")

    def test_workflow_stats(self):
        """Test workflow statistics"""
        # Create multiple leads
        for i in range(3):
            lead_data = self.test_lead_data.copy()
            lead_data["phone_number"] = f"+123456789{i}"
            self.service.create_lead_profile(lead_data)

        stats = self.service.get_workflow_stats()

        self.assertEqual(stats["total_leads"], 3)
        self.assertIn(NurturingStage.NEW_LEAD.value, stats["leads_by_stage"])
        self.assertEqual(stats["leads_by_stage"][NurturingStage.NEW_LEAD.value], 3)

    def test_generate_task_content(self):
        """Test task content generation"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)
        lead = self.service.leads[lead_id]

        # Test welcome message
        content = self.service._generate_task_content(
            Mock(task_type=TaskType.WELCOME_MESSAGE),
            lead
        )
        self.assertIn("Welcome", content)
        self.assertIn(lead.name, content)

        # Test follow-up message
        content = self.service._generate_task_content(
            Mock(task_type=TaskType.FOLLOW_UP),
            lead
        )
        self.assertIn("we noticed you were looking", content)

    def test_abandoned_lead_detection(self):
        """Test abandoned lead detection"""
        lead_id = self.service.create_lead_profile(self.test_lead_data)

        # Simulate old interaction
        lead = self.service.leads[lead_id]
        lead.last_interaction = datetime.now() - timedelta(hours=73)  # More than 72 hours

        # Run abandoned check
        asyncio.run(self.service._check_abandoned_leads())

        # Lead should be marked as abandoned
        self.assertEqual(lead.stage, NurturingStage.ABANDONED)


class TestAdvancedRAGService(TestCase):
    """Test cases for advanced RAG service"""

    def setUp(self):
        """Set up test fixtures"""
        self.service = AdvancedRAGService()

    @patch('services.advanced_rag.RAGVectorDB')
    def test_advanced_retrieve_basic(self, mock_vector_db):
        """Test basic advanced retrieval"""
        # Mock vector DB
        mock_db_instance = Mock()
        mock_vector_db.return_value = mock_db_instance
        mock_db_instance.search.return_value = [
            ("doc1", 0.9, {"content": "Test content", "doc_type": "trek_info"}),
            ("doc2", 0.8, {"content": "More content", "doc_type": "pricing"})
        ]

        # Reinitialize service with mock
        self.service = AdvancedRAGService()

        async def run_test():
            result = await self.service.advanced_retrieve("test query", top_k=2)

            self.assertIn("query", result)
            self.assertIn("results", result)
            self.assertEqual(len(result["results"]), 2)
            self.assertEqual(result["results"][0]["doc_id"], "doc1")

        asyncio.run(run_test())

    def test_query_analysis(self):
        """Test query analysis"""
        analysis = self.service.search_engine.analyze_query("How much does Everest trek cost?")

        self.assertEqual(analysis.intent, "pricing")
        self.assertIn("everest", analysis.entities)
        self.assertIn("pricing", analysis.domains)
        self.assertEqual(analysis.query_type, "factual")

    def test_query_analysis_complex(self):
        """Test complex query analysis"""
        analysis = self.service.search_engine.analyze_query(
            "Compare Everest Base Camp and Manali trek prices for groups"
        )

        self.assertEqual(analysis.intent, "pricing")
        self.assertIn("everest", analysis.entities)
        self.assertIn("manali", analysis.entities)
        self.assertEqual(analysis.query_type, "comparative")
        self.assertIn("complex", analysis.complexity)

    @patch('services.advanced_rag.RAGVectorDB')
    def test_batch_retrieve(self, mock_vector_db):
        """Test batch retrieval"""
        mock_db_instance = Mock()
        mock_vector_db.return_value = mock_db_instance
        mock_db_instance.search.return_value = [
            ("doc1", 0.9, {"content": "Batch content"})
        ]

        self.service = AdvancedRAGService()

        async def run_test():
            queries = ["query1", "query2", "query3"]
            results = await self.service.batch_retrieve(queries, batch_size=2)

            self.assertEqual(len(results), 3)
            for result in results:
                self.assertIn("query", result)
                self.assertIn("results", result)

        asyncio.run(run_test())

    def test_performance_tracking(self):
        """Test performance tracking"""
        # Track some operations
        self.service.performance_optimizer.track_performance("test_op", 1.5, True)
        self.service.performance_optimizer.track_performance("test_op", 2.0, False)
        self.service.performance_optimizer.track_performance("test_op", 1.8, True)

        stats = self.service.get_performance_stats()

        self.assertIn("test_op", stats)
        test_op_stats = stats["test_op"]
        self.assertEqual(test_op_stats["total_calls"], 3)
        self.assertAlmostEqual(test_op_stats["avg_response_time"], 1.767, places=2)
        self.assertAlmostEqual(test_op_stats["success_rate"], 2/3, places=2)

    def test_content_enrichment(self):
        """Test content enrichment"""
        content = "Everest Base Camp trek information"
        metadata = {
            "doc_type": "trek_info",
            "trek_name": "Everest Base Camp",
            "source": "test.pdf"
        }

        enriched_content, enriched_metadata = self.service.content_enricher.enrich_content(
            content, metadata, strategies=["context_expansion", "metadata_enhancement"]
        )

        self.assertIn("Everest Base Camp", enriched_content)
        self.assertIn("quality_score", enriched_metadata)
        self.assertIn("last_enriched", enriched_metadata)

    def test_cache_functionality(self):
        """Test caching functionality"""
        query = "test cache query"
        mock_results = [
            RetrievalResult(
                doc_id="cached_doc",
                content="Cached content",
                score=0.9,
                metadata={"cached": True},
                embedding_strategy="standard",
                retrieval_method="vector_search",
                timestamp=datetime.now()
            )
        ]

        # Cache results
        self.service.performance_optimizer.cache_retrieval_result(query, mock_results)

        # Retrieve from cache
        cached = self.service.performance_optimizer.get_cached_result(query)

        self.assertIsNotNone(cached)
        self.assertEqual(len(cached), 1)
        self.assertEqual(cached[0].doc_id, "cached_doc")

    def test_query_optimization(self):
        """Test query optimization"""
        analysis = QueryAnalysis(
            query="everest price",
            intent="pricing",
            entities=["everest"],
            keywords=["everest", "price"],
            query_type="factual",
            complexity="simple",
            domains=["pricing"]
        )

        optimized = self.service.performance_optimizer.optimize_query("everest price", analysis)

        self.assertIn("everest price", optimized)
        self.assertIn("cost price budget", optimized)

    def test_system_stats(self):
        """Test system statistics"""
        stats = self.service.get_system_stats()

        self.assertIn("vector_database", stats)
        self.assertIn("performance", stats)
        self.assertIn("components", stats)

        components = stats["components"]
        self.assertIn("embedding_strategies", components)
        self.assertIn("search_strategies", components)
        self.assertIn("enrichment_strategies", components)


class TestPhase5_6Integration(TestCase):
    """Integration tests for Phase 5 & 6"""

    def setUp(self):
        """Set up integration test fixtures"""
        self.nurturing_service = get_nurturing_service()
        self.rag_service = get_advanced_rag_service()

    def test_services_initialization(self):
        """Test that services initialize properly"""
        self.assertIsNotNone(self.nurturing_service)
        self.assertIsNotNone(self.rag_service)

        # Test nurturing service has required attributes
        self.assertTrue(hasattr(self.nurturing_service, 'leads'))
        self.assertTrue(hasattr(self.nurturing_service, 'tasks'))
        self.assertTrue(hasattr(self.nurturing_service, 'workflows'))

        # Test RAG service has required attributes
        self.assertTrue(hasattr(self.rag_service, 'vector_db'))
        self.assertTrue(hasattr(self.rag_service, 'search_engine'))
        self.assertTrue(hasattr(self.rag_service, 'embedding_engine'))

    def test_end_to_end_nurturing_workflow(self):
        """Test complete nurturing workflow"""
        # Create lead
        lead_data = {
            "phone_number": "+1987654321",
            "name": "Integration Test User",
            "preferred_trek_types": ["Everest Base Camp"]
        }

        lead_id = self.nurturing_service.create_lead_profile(lead_data)
        self.assertIsNotNone(lead_id)

        # Update interaction
        self.nurturing_service.update_lead_interaction(lead_id, "inquiry")

        # Check status
        status = self.nurturing_service.get_lead_status(lead_id)
        self.assertEqual(status["stage"], "engaged")

        # Schedule task
        task_id = self.nurturing_service.schedule_task(
            lead_id=lead_id,
            task_type=TaskType.SPECIAL_OFFER,
            priority=TaskPriority.HIGH,
            delay_hours=0,
            content={"offer": "20% discount"}
        )

        # Complete task
        result = self.nurturing_service.complete_task(task_id)
        self.assertTrue(result["success"])

    @patch('services.advanced_rag.RAGVectorDB')
    def test_end_to_end_rag_workflow(self, mock_vector_db):
        """Test complete RAG workflow"""
        # Mock vector DB for testing
        mock_db_instance = Mock()
        mock_vector_db.return_value = mock_db_instance
        mock_db_instance.search.return_value = [
            ("test_doc", 0.95, {"content": "Everest trek costs between ₹35,000-₹65,000"})
        ]
        mock_db_instance.get_document_stats.return_value = {"total_vectors": 10}

        # Reinitialize service
        self.rag_service = AdvancedRAGService()

        async def run_integration_test():
            # Test retrieval
            result = await self.rag_service.advanced_retrieve("everest trek price")

            self.assertIn("results", result)
            self.assertGreater(len(result["results"]), 0)

            # Test with context
            context_result = await self.rag_service.retrieve_with_context("everest trek price")
            self.assertIn("main_results", context_result)
            self.assertIn("query_analysis", context_result)

            # Test performance stats
            stats = self.rag_service.get_performance_stats()
            self.assertIsInstance(stats, dict)

        asyncio.run(run_integration_test())


if __name__ == '__main__':
    unittest.main()