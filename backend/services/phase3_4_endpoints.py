"""
Phase 3 & 4 API Endpoints: Message Templates & Analytics
Django REST Framework endpoints for template management and analytics.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import datetime, timedelta
from .message_template_service import (
    get_message_template_service,
    TemplateCategory,
    TemplateApprovalStatus,
    PrebuiltTemplates
)
from .analytics_engine import (
    get_analytics_engine,
    TrackingEventType,
    AttributionModel
)


class MessageTemplateViewSet(viewsets.ViewSet):
    """API endpoints for WhatsApp message templates"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['post'])
    def create_template(self, request):
        """Create a new message template"""
        service = get_message_template_service()
        
        data = request.data
        template = service.create_template(
            template_name=data.get('template_name'),
            category=TemplateCategory[data.get('category', 'TRANSACTIONAL')],
            body=data.get('body'),
            header=data.get('header'),
            footer=data.get('footer'),
            buttons=data.get('buttons'),
            variables=data.get('variables'),
            language=data.get('language', 'en')
        )
        
        return Response(template, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def list_templates(self, request):
        """List all templates with their approval status"""
        service = get_message_template_service()
        
        templates = []
        for name, template in service.templates.items():
            templates.append({
                "template_id": template["template_id"],
                "name": name,
                "category": template["category"],
                "status": template["status"],
                "variables": len(template["variables"]),
                "meta_template_id": template.get("meta_template_id"),
                "created_at": template["created_at"]
            })
        
        return Response({
            "total": len(templates),
            "templates": templates
        })
    
    @action(detail=False, methods=['get'])
    def status_summary(self, request):
        """Get summary of templates by approval status"""
        service = get_message_template_service()
        summary = service.get_template_status_summary()
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def approved_templates(self, request):
        """Get all approved templates ready to send"""
        service = get_message_template_service()
        approved = service.get_approved_templates()
        
        return Response({
            "total_approved": len(approved),
            "templates": approved
        })
    
    @action(detail=False, methods=['post'])
    def substitute_variables(self, request):
        """Substitute variables in a template"""
        service = get_message_template_service()
        
        template_name = request.data.get('template_name')
        variables = request.data.get('variables', {})
        
        message, error = service.substitute_variables(template_name, variables)
        
        if error:
            return Response(
                {"error": error},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            "template_name": template_name,
            "message": message,
            "ready_to_send": True
        })
    
    @action(detail=False, methods=['post'])
    def submit_for_approval(self, request):
        """Submit template to Meta for approval"""
        service = get_message_template_service()
        
        template_name = request.data.get('template_name')
        meta_account = request.data.get('meta_business_account_id')
        
        result = service.submit_for_approval(template_name, meta_account)
        
        status_code = status.HTTP_200_OK if result.get('success') else status.HTTP_400_BAD_REQUEST
        return Response(result, status=status_code)
    
    @action(detail=False, methods=['get'])
    def approval_status(self, request):
        """Check approval status of a submission"""
        service = get_message_template_service()
        
        approval_id = request.query_params.get('approval_id')
        result = service.check_approval_status(approval_id)
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def prebuilt_templates(self, request):
        """Get prebuilt template definitions"""
        templates = {
            "booking_confirmation": PrebuiltTemplates.get_booking_confirmation_template(),
            "payment_reminder": PrebuiltTemplates.get_payment_reminder_template(),
            "trip_update": PrebuiltTemplates.get_trip_update_template(),
            "support_response": PrebuiltTemplates.get_support_response_template(),
            "referral_invite": PrebuiltTemplates.get_referral_template()
        }
        
        return Response({
            "total_prebuilt": len(templates),
            "templates": templates
        })


class AnalyticsViewSet(viewsets.ViewSet):
    """API endpoints for analytics and attribution tracking"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def track_event(self, request):
        """Track a user interaction event"""
        engine = get_analytics_engine()
        
        data = request.data
        result = engine.track_event(
            event_type=TrackingEventType[data.get('event_type', 'PAGE_VISIT')],
            user_id=data.get('user_id'),
            phone=data.get('phone'),
            campaign_id=data.get('campaign_id'),
            trip_id=data.get('trip_id'),
            metadata=data.get('metadata')
        )
        
        return Response(result, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_qr_campaign(self, request):
        """Create a QR tracking campaign"""
        engine = get_analytics_engine()
        
        data = request.data
        result = engine.create_qr_campaign(
            campaign_id=data.get('campaign_id'),
            campaign_name=data.get('campaign_name'),
            trip_id=data.get('trip_id'),
            qr_data=data.get('qr_data', {}),
            start_date=datetime.fromisoformat(data.get('start_date')),
            end_date=datetime.fromisoformat(data.get('end_date')),
            budget=data.get('budget')
        )
        
        return Response(result, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def campaign_metrics(self, request):
        """Get metrics for a specific QR campaign"""
        engine = get_analytics_engine()
        
        campaign_id = request.query_params.get('campaign_id')
        metrics = engine.get_qr_campaign_metrics(campaign_id)
        
        return Response(metrics)
    
    @action(detail=False, methods=['post'])
    def define_funnel(self, request):
        """Define a conversion funnel"""
        engine = get_analytics_engine()
        
        data = request.data
        steps = [TrackingEventType[step] for step in data.get('steps', [])]
        
        result = engine.define_conversion_funnel(
            funnel_name=data.get('funnel_name'),
            steps=steps,
            time_window_hours=data.get('time_window_hours', 72)
        )
        
        return Response(result, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def funnel_analysis(self, request):
        """Analyze conversion funnel performance"""
        engine = get_analytics_engine()
        
        funnel_name = request.query_params.get('funnel_name')
        analysis = engine.analyze_conversion_funnel(funnel_name)
        
        return Response(analysis)
    
    @action(detail=False, methods=['get'])
    def user_attribution(self, request):
        """Calculate attribution for a user"""
        engine = get_analytics_engine()
        
        user_id = request.query_params.get('user_id')
        model = request.query_params.get('model', 'LINEAR')
        
        attribution = engine.calculate_attribution(
            user_id=user_id,
            model=AttributionModel[model]
        )
        
        return Response(attribution)
    
    @action(detail=False, methods=['get'])
    def campaign_summary(self, request):
        """Get summary of all active campaigns"""
        engine = get_analytics_engine()
        summary = engine.get_campaign_summary()
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def events_by_type(self, request):
        """Get event counts by type"""
        engine = get_analytics_engine()
        
        event_counts = {}
        for event in engine.events:
            event_type = event['event_type']
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        return Response({
            "total_events": len(engine.events),
            "by_type": event_counts
        })
    
    @action(detail=False, methods=['get'])
    def top_campaigns(self, request):
        """Get top performing campaigns by revenue/conversions"""
        engine = get_analytics_engine()
        
        limit = int(request.query_params.get('limit', 10))
        sort_by = request.query_params.get('sort_by', 'revenue')  # revenue or conversions
        
        campaigns_data = []
        for campaign_id, campaign_data in engine.campaigns.items():
            metrics = campaign_data["metrics"]
            campaigns_data.append({
                "campaign_id": campaign_id,
                "name": campaign_data["campaign"].campaign_name,
                "revenue": metrics["revenue_generated"],
                "conversions": metrics["bookings_completed"],
                "conversion_rate": metrics["conversion_rate"]
            })
        
        # Sort
        if sort_by == "conversions":
            campaigns_data.sort(key=lambda x: x['conversions'], reverse=True)
        else:
            campaigns_data.sort(key=lambda x: x['revenue'], reverse=True)
        
        return Response({
            "top_campaigns": campaigns_data[:limit]
        })
