from rest_framework import serializers
from core.models.qr_models import QRCampaign, QRCodeEvent, QRAnalytics


class QRCampaignSerializer(serializers.ModelSerializer):
    """Serializer for QR Campaign model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    conversion_rate = serializers.FloatField(read_only=True)
    click_through_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = QRCampaign
        fields = [
            'id',
            'name',
            'description',
            'url',
            'utm_source',
            'utm_campaign',
            'status',
            'campaign_type',
            'color_dark',
            'color_light',
            'size',
            'error_correction',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'total_scans',
            'total_clicks',
            'total_installs',
            'conversion_rate',
            'click_through_rate',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'total_scans',
            'total_clicks',
            'total_installs',
            'created_by',
            'created_by_name',
        ]


class QRCodeEventSerializer(serializers.ModelSerializer):
    """Serializer for QR Code Event model"""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    
    class Meta:
        model = QRCodeEvent
        fields = [
            'id',
            'campaign',
            'campaign_name',
            'event_type',
            'session_id',
            'user_agent',
            'ip_address',
            'device_type',
            'os',
            'browser',
            'country',
            'city',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'campaign_name',
        ]


class QRAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for QR Analytics model"""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    
    class Meta:
        model = QRAnalytics
        fields = [
            'id',
            'campaign',
            'campaign_name',
            'date',
            'scans',
            'clicks',
            'installs',
            'unique_sessions',
            'mobile_scans',
            'tablet_scans',
            'desktop_scans',
            'ios_scans',
            'android_scans',
            'other_scans',
            'top_country',
            'top_city',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]
