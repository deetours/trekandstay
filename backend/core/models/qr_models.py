from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class QRCampaign(models.Model):
    """Model to store QR code campaigns"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    url = models.URLField()
    utm_source = models.CharField(max_length=50, default='qr')
    utm_campaign = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Campaign metadata
    campaign_type = models.CharField(
        max_length=50,
        choices=[
            ('print_ads', 'Print Ads'),
            ('posters', 'Outdoor Posters'),
            ('business_cards', 'Business Cards'),
            ('email', 'Email Campaign'),
            ('social_media', 'Social Media'),
            ('events', 'Events'),
            ('other', 'Other'),
        ],
        default='other'
    )
    
    # QR Code customization
    color_dark = models.CharField(max_length=7, default='#1F2937')
    color_light = models.CharField(max_length=7, default='#FFFFFF')
    size = models.IntegerField(default=300)
    error_correction = models.CharField(
        max_length=1,
        choices=[('L', 'Low'), ('M', 'Medium'), ('Q', 'Quartile'), ('H', 'High')],
        default='H'
    )
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Analytics
    total_scans = models.IntegerField(default=0)
    total_clicks = models.IntegerField(default=0)
    total_installs = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'QR Campaign'
        verbose_name_plural = 'QR Campaigns'
        indexes = [
            models.Index(fields=['utm_campaign']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.utm_campaign})"
    
    @property
    def conversion_rate(self):
        """Calculate conversion rate (installs / scans)"""
        if self.total_scans == 0:
            return 0
        return round((self.total_installs / self.total_scans) * 100, 2)
    
    @property
    def click_through_rate(self):
        """Calculate click through rate (clicks / scans)"""
        if self.total_scans == 0:
            return 0
        return round((self.total_clicks / self.total_scans) * 100, 2)


class QRCodeEvent(models.Model):
    """Model to track QR code events"""
    EVENT_CHOICES = [
        ('scan', 'QR Code Scanned'),
        ('click', 'Link Clicked'),
        ('install', 'App Installed'),
        ('open', 'App Opened'),
        ('view', 'Page Viewed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(QRCampaign, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    
    # User info (anonymized)
    session_id = models.CharField(max_length=100, db_index=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Device info
    device_type = models.CharField(
        max_length=20,
        choices=[
            ('mobile', 'Mobile'),
            ('tablet', 'Tablet'),
            ('desktop', 'Desktop'),
            ('unknown', 'Unknown'),
        ],
        default='unknown'
    )
    os = models.CharField(
        max_length=20,
        choices=[
            ('ios', 'iOS'),
            ('android', 'Android'),
            ('windows', 'Windows'),
            ('mac', 'macOS'),
            ('linux', 'Linux'),
            ('unknown', 'Unknown'),
        ],
        default='unknown'
    )
    browser = models.CharField(max_length=50, blank=True)
    
    # Location (if available)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'QR Event'
        verbose_name_plural = 'QR Events'
        indexes = [
            models.Index(fields=['campaign', '-created_at']),
            models.Index(fields=['session_id']),
            models.Index(fields=['event_type']),
        ]
    
    def __str__(self):
        return f"{self.campaign.name} - {self.event_type}"


class QRAnalytics(models.Model):
    """Daily analytics snapshot for QR campaigns"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(QRCampaign, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(db_index=True)
    
    # Daily stats
    scans = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    installs = models.IntegerField(default=0)
    unique_sessions = models.IntegerField(default=0)
    
    # Device breakdown
    mobile_scans = models.IntegerField(default=0)
    tablet_scans = models.IntegerField(default=0)
    desktop_scans = models.IntegerField(default=0)
    
    # OS breakdown
    ios_scans = models.IntegerField(default=0)
    android_scans = models.IntegerField(default=0)
    other_scans = models.IntegerField(default=0)
    
    # Geographic breakdown
    top_country = models.CharField(max_length=100, blank=True)
    top_city = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        unique_together = [['campaign', 'date']]
        verbose_name = 'QR Analytics'
        verbose_name_plural = 'QR Analytics'
        indexes = [
            models.Index(fields=['campaign', '-date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.campaign.name} - {self.date}"
