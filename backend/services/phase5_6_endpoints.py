"""
Phase 5 & 6 API Endpoints
REST API endpoints for Lead Nurturing & Automation and Advanced RAG features.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from typing import Dict, Any, List
import json
import asyncio

from .nurturing_automation import get_nurturing_service
from .advanced_rag import get_advanced_rag_service


class NurturingAutomationViewSet(viewsets.ViewSet):
    """API endpoints for lead nurturing automation"""

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.nurturing_service = get_nurturing_service()

    @action(detail=False, methods=['post'])
    def create_lead_profile(self, request):
        """Create a new lead profile for nurturing"""
        try:
            lead_data = request.data
            required_fields = ['phone_number']

            if not all(field in lead_data for field in required_fields):
                return Response(
                    {"error": "Missing required fields: phone_number"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            lead_id = self.nurturing_service.create_lead_profile(lead_data)

            return Response({
                "success": True,
                "lead_id": lead_id,
                "message": "Lead profile created and nurturing workflow started"
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def update_lead_interaction(self, request):
        """Update lead interaction and adjust nurturing stage"""
        try:
            data = request.data
            lead_id = data.get('lead_id')
            interaction_type = data.get('interaction_type')

            if not lead_id or not interaction_type:
                return Response(
                    {"error": "lead_id and interaction_type are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            self.nurturing_service.update_lead_interaction(lead_id, interaction_type)

            return Response({
                "success": True,
                "message": f"Lead {lead_id} interaction updated"
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def get_lead_status(self, request):
        """Get nurturing status for a lead"""
        try:
            lead_id = request.query_params.get('lead_id')

            if not lead_id:
                return Response(
                    {"error": "lead_id parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            lead_status = self.nurturing_service.get_lead_status(lead_id)

            if not lead_status:
                return Response(
                    {"error": "Lead not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(lead_status)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def get_pending_tasks(self, request):
        """Get pending nurturing tasks"""
        try:
            lead_id = request.query_params.get('lead_id')
            tasks = self.nurturing_service.get_pending_tasks(lead_id)

            return Response({
                "tasks": tasks,
                "total": len(tasks)
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def complete_task(self, request):
        """Mark a nurturing task as completed"""
        try:
            task_id = request.data.get('task_id')
            notes = request.data.get('notes')

            if not task_id:
                return Response(
                    {"error": "task_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            result = self.nurturing_service.complete_task(task_id, notes)

            if not result['success']:
                return Response(
                    {"error": result.get('error', 'Task completion failed')},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(result)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def get_workflow_stats(self, request):
        """Get nurturing workflow statistics"""
        try:
            stats = self.nurturing_service.get_workflow_stats()

            return Response({
                "stats": stats,
                "timestamp": timezone.now().isoformat()
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def trigger_workflow(self, request):
        """Manually trigger a nurturing workflow"""
        try:
            data = request.data
            lead_id = data.get('lead_id')
            phone = data.get('phone')
            workflow_id = data.get('workflow_id', 'standard')

            if not lead_id or not phone:
                return Response(
                    {"error": "lead_id and phone are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # For async operations, we'd need to handle this differently
            # For now, create a simple task
            task_id = self.nurturing_service.schedule_task(
                lead_id=lead_id,
                task_type=self.nurturing_service.tasks_module.TaskType.WELCOME_MESSAGE,
                priority=self.nurturing_service.tasks_module.TaskPriority.HIGH,
                delay_hours=0,
                content={"manual_trigger": True, "workflow": workflow_id}
            )

            return Response({
                "success": True,
                "task_id": task_id,
                "message": f"Workflow triggered for lead {lead_id}"
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdvancedRAGViewSet(viewsets.ViewSet):
    """API endpoints for Advanced RAG features"""

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.rag_service = get_advanced_rag_service()

    @action(detail=False, methods=['post'])
    def advanced_retrieve(self, request):
        """Advanced document retrieval with optimizations"""
        try:
            query = request.data.get('query')
            top_k = request.data.get('top_k', 5)
            use_cache = request.data.get('use_cache', True)
            optimize_query = request.data.get('optimize_query', True)
            enrich_content = request.data.get('enrich_content', True)

            if not query:
                return Response(
                    {"error": "query is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Run async retrieval
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                result = loop.run_until_complete(
                    self.rag_service.advanced_retrieve(
                        query=query,
                        top_k=top_k,
                        use_cache=use_cache,
                        optimize_query=optimize_query,
                        enrich_content=enrich_content
                    )
                )
            finally:
                loop.close()

            return Response(result)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def retrieve_with_context(self, request):
        """Retrieve documents with comprehensive context"""
        try:
            query = request.data.get('query')
            context_type = request.data.get('context_type', 'comprehensive')

            if not query:
                return Response(
                    {"error": "query is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Run async retrieval
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                result = loop.run_until_complete(
                    self.rag_service.retrieve_with_context(
                        query=query,
                        context_type=context_type
                    )
                )
            finally:
                loop.close()

            return Response(result)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def batch_retrieve(self, request):
        """Batch retrieve for multiple queries"""
        try:
            queries = request.data.get('queries', [])
            batch_size = request.data.get('batch_size', 5)

            if not queries or not isinstance(queries, list):
                return Response(
                    {"error": "queries must be a non-empty list"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Run async batch retrieval
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                results = loop.run_until_complete(
                    self.rag_service.batch_retrieve(
                        queries=queries,
                        batch_size=batch_size
                    )
                )
            finally:
                loop.close()

            return Response({
                "results": results,
                "total_queries": len(queries),
                "batch_size": batch_size
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def get_performance_stats(self, request):
        """Get RAG performance statistics"""
        try:
            stats = self.rag_service.get_performance_stats()

            return Response({
                "performance_stats": stats,
                "timestamp": timezone.now().isoformat()
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def get_system_stats(self, request):
        """Get overall RAG system statistics"""
        try:
            stats = self.rag_service.get_system_stats()

            return Response({
                "system_stats": stats,
                "timestamp": timezone.now().isoformat()
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def optimize_index(self, request):
        """Optimize the vector index"""
        try:
            # Run async optimization
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                loop.run_until_complete(self.rag_service.optimize_index())
            finally:
                loop.close()

            return Response({
                "success": True,
                "message": "Index optimization completed"
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def health_check(self, request):
        """RAG service health check"""
        try:
            # Run async health check
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                health = loop.run_until_complete(self.rag_service.health_check())
            finally:
                loop.close()

            http_status = status.HTTP_200_OK if health['status'] == 'healthy' else status.HTTP_503_SERVICE_UNAVAILABLE

            return Response(health, status=http_status)

        except Exception as e:
            return Response(
                {"status": "error", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def analyze_query(self, request):
        """Analyze a query for optimization insights"""
        try:
            query = request.data.get('query')

            if not query:
                return Response(
                    {"error": "query is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            analysis = self.rag_service.search_engine.analyze_query(query)

            return Response({
                "query": query,
                "analysis": {
                    "intent": analysis.intent,
                    "entities": analysis.entities,
                    "keywords": analysis.keywords,
                    "query_type": analysis.query_type,
                    "complexity": analysis.complexity,
                    "domains": analysis.domains
                }
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
def phase5_6_status(request):
    """Get status of Phase 5 & 6 implementation"""
    try:
        # Get nurturing service stats
        nurturing_service = get_nurturing_service()
        nurturing_stats = nurturing_service.get_workflow_stats()

        # Get RAG service stats
        rag_service = get_advanced_rag_service()
        rag_stats = rag_service.get_system_stats()

        return Response({
            "phase": "5_6",
            "status": "active",
            "nurturing_automation": {
                "leads_count": nurturing_stats.get("total_leads", 0),
                "pending_tasks": nurturing_stats.get("pending_tasks", 0),
                "active_workflows": len(nurturing_stats.get("leads_by_stage", {}))
            },
            "advanced_rag": {
                "documents_count": rag_stats.get("vector_database", {}).get("total_vectors", 0),
                "performance": rag_stats.get("performance", {})
            },
            "timestamp": timezone.now().isoformat()
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )