from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q, F
from django.utils import timezone
from datetime import timedelta
import qrcode
import io
import base64
import uuid

from core.models.qr_models import QRCampaign, QRCodeEvent, QRAnalytics
from .serializers import QRCampaignSerializer, QRCodeEventSerializer, QRAnalyticsSerializer


class QRCampaignViewSet(viewsets.ModelViewSet):
    """
    API endpoints for QR Campaign management
    
    Endpoints:
    - GET /api/qr-campaigns/ - List all campaigns
    - POST /api/qr-campaigns/ - Create new campaign
    - GET /api/qr-campaigns/{id}/ - Get campaign details
    - PUT /api/qr-campaigns/{id}/ - Update campaign
    - DELETE /api/qr-campaigns/{id}/ - Delete campaign
    - GET /api/qr-campaigns/{id}/qr-image/ - Get QR code as image
    - GET /api/qr-campaigns/{id}/analytics/ - Get campaign analytics
    - POST /api/qr-campaigns/{id}/track/ - Track QR event
    """
    
    queryset = QRCampaign.objects.all()
    serializer_class = QRCampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['status', 'campaign_type', 'utm_campaign']
    ordering_fields = ['created_at', 'total_scans', 'total_installs']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Set the user when creating a campaign"""
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def qr_image(self, request, pk=None):
        """
        Generate and return QR code as PNG image
        GET /api/qr-campaigns/{id}/qr-image/
        """
        campaign = self.get_object()
        
        try:
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=getattr(qrcode.constants, f'ERROR_CORRECT_{campaign.error_correction}'),
                box_size=10,
                border=2,
            )
            qr.add_data(campaign.url)
            qr.make(fit=True)
            
            # Create image with custom colors
            img = qr.make_image(
                fill_color=campaign.color_dark,
                back_color=campaign.color_light
            )
            
            # Convert to bytes
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            img_io.seek(0)
            
            # Return as base64
            qr_data = base64.b64encode(img_io.getvalue()).decode()
            
            return Response({
                'success': True,
                'campaign_id': str(campaign.id),
                'campaign_name': campaign.name,
                'url': campaign.url,
                'qr_data': f'data:image/png;base64,{qr_data}',
                'size': campaign.size,
                'error_correction': campaign.error_correction,
                'colors': {
                    'dark': campaign.color_dark,
                    'light': campaign.color_light
                }
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Get detailed analytics for a campaign
        GET /api/qr-campaigns/{id}/analytics/
        """
        campaign = self.get_object()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get daily analytics
        daily_stats = QRAnalytics.objects.filter(
            campaign=campaign,
            date__gte=start_date.date()
        ).order_by('date')
        
        # Calculate cumulative stats
        events = QRCodeEvent.objects.filter(
            campaign=campaign,
            created_at__gte=start_date
        )
        
        stats = {
            'campaign_id': str(campaign.id),
            'campaign_name': campaign.name,
            'summary': {
                'total_scans': campaign.total_scans,
                'total_clicks': campaign.total_clicks,
                'total_installs': campaign.total_installs,
                'conversion_rate': campaign.conversion_rate,
                'click_through_rate': campaign.click_through_rate,
            },
            'period': {
                'scans': events.filter(event_type='scan').count(),
                'clicks': events.filter(event_type='click').count(),
                'installs': events.filter(event_type='install').count(),
            },
            'daily': QRAnalyticsSerializer(daily_stats, many=True).data,
            'device_breakdown': {
                'mobile': events.filter(device_type='mobile').count(),
                'tablet': events.filter(device_type='tablet').count(),
                'desktop': events.filter(device_type='desktop').count(),
            },
            'os_breakdown': {
                'ios': events.filter(os='ios').count(),
                'android': events.filter(os='android').count(),
                'other': events.exclude(os__in=['ios', 'android']).count(),
            },
            'top_countries': list(
                events.values('country')
                .annotate(count=Sum('id'))
                .order_by('-count')[:5]
            ),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def track(self, request, pk=None):
        """
        Track a QR code event (scan, click, install)
        POST /api/qr-campaigns/{id}/track/
        
        Body:
        {
            "event_type": "scan" | "click" | "install",
            "session_id": "unique-session-id",
            "device_type": "mobile" | "tablet" | "desktop",
            "os": "ios" | "android" | "windows" | "mac" | "linux",
            "browser": "Chrome",
            "country": "India",
            "city": "Mumbai"
        }
        """
        campaign = self.get_object()
        
        try:
            event_type = request.data.get('event_type', 'scan')
            session_id = request.data.get('session_id', str(uuid.uuid4()))
            
            # Validate event type
            valid_events = ['scan', 'click', 'install', 'open', 'view']
            if event_type not in valid_events:
                return Response(
                    {'error': f'Invalid event_type. Must be one of {valid_events}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create event
            event = QRCodeEvent.objects.create(
                campaign=campaign,
                event_type=event_type,
                session_id=session_id,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                ip_address=self._get_client_ip(request),
                device_type=request.data.get('device_type', 'unknown'),
                os=request.data.get('os', 'unknown'),
                browser=request.data.get('browser', '')[:50],
                country=request.data.get('country', '')[:100],
                city=request.data.get('city', '')[:100],
            )
            
            # Update campaign stats
            if event_type == 'scan':
                campaign.total_scans = F('total_scans') + 1
            elif event_type == 'click':
                campaign.total_clicks = F('total_clicks') + 1
            elif event_type == 'install':
                campaign.total_installs = F('total_installs') + 1
            
            campaign.save()
            campaign.refresh_from_db()
            
            return Response({
                'success': True,
                'event_id': str(event.id),
                'campaign_name': campaign.name,
                'event_type': event_type,
                'campaign_stats': {
                    'total_scans': campaign.total_scans,
                    'total_clicks': campaign.total_clicks,
                    'total_installs': campaign.total_installs,
                    'conversion_rate': campaign.conversion_rate,
                }
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get summary of all QR campaigns
        GET /api/qr-campaigns/summary/
        """
        campaigns = self.get_queryset()
        
        summary = {
            'total_campaigns': campaigns.count(),
            'active_campaigns': campaigns.filter(status='active').count(),
            'total_scans': campaigns.aggregate(Sum('total_scans'))['total_scans__sum'] or 0,
            'total_clicks': campaigns.aggregate(Sum('total_clicks'))['total_clicks__sum'] or 0,
            'total_installs': campaigns.aggregate(Sum('total_installs'))['total_installs__sum'] or 0,
            'campaigns_by_type': {},
            'top_performing': []
        }
        
        # Campaigns by type
        for campaign in campaigns:
            ctype = campaign.get_campaign_type_display()
            if ctype not in summary['campaigns_by_type']:
                summary['campaigns_by_type'][ctype] = 0
            summary['campaigns_by_type'][ctype] += 1
        
        # Top performing campaigns
        top = campaigns.order_by('-total_installs')[:5]
        summary['top_performing'] = QRCampaignSerializer(top, many=True).data
        
        return Response(summary)
    
    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class QRCodeEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for QR Code events (read-only)
    
    Endpoints:
    - GET /api/qr-events/ - List all events with filters
    - GET /api/qr-events/{id}/ - Get event details
    """
    
    queryset = QRCodeEvent.objects.all()
    serializer_class = QRCodeEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['campaign', 'event_type', 'device_type', 'os']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class QRAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for QR Analytics (read-only)
    
    Endpoints:
    - GET /api/qr-analytics/ - List analytics with filters
    - GET /api/qr-analytics/{id}/ - Get analytics details
    """
    
    queryset = QRAnalytics.objects.all()
    serializer_class = QRAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['campaign', 'date']
    ordering_fields = ['date', 'scans', 'installs']
    ordering = ['-date']
