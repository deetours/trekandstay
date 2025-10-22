"""
WhatsApp Database Models
Track messages, conversations, and webhooks for analytics

Add these to your Django models and run:
    python manage.py makemigrations
    python manage.py migrate
"""

from django.db import models
from django.utils import timezone


class WhatsAppMessage(models.Model):
    """Store individual messages (incoming + outgoing)"""
    
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('document', 'Document'),
        ('video', 'Video'),
        ('audio', 'Audio'),
    ]
    
    DIRECTION_CHOICES = [
        ('incoming', 'Incoming (Customer)'),
        ('outgoing', 'Outgoing (Agent)'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
        ('scheduled', 'Scheduled'),
    ]
    
    # Message identification
    message_id = models.CharField(max_length=100, unique=True, db_index=True)
    phone_number = models.CharField(max_length=20, db_index=True)
    
    # Message content
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    message_text = models.TextField()
    media_url = models.URLField(null=True, blank=True)
    
    # Direction
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # For outgoing messages (agent reply)
    intent_detected = models.CharField(max_length=50, null=True, blank=True)
    confidence_score = models.FloatField(default=0.0)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "WhatsApp Message"
        verbose_name_plural = "WhatsApp Messages"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number', '-created_at']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        direction_icon = "↓" if self.direction == "incoming" else "↑"
        return f"{direction_icon} {self.phone_number} - {self.message_text[:50]}..."


class WhatsAppConversation(models.Model):
    """Group messages into conversations with customers"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    # Customer identification
    phone_number = models.CharField(max_length=20, unique=True, db_index=True)
    customer_name = models.CharField(max_length=100, null=True, blank=True)
    customer_id = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    
    # Conversation status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Conversation stats
    message_count = models.IntegerField(default=0)
    customer_message_count = models.IntegerField(default=0)
    agent_message_count = models.IntegerField(default=0)
    
    # Intent analysis
    primary_intent = models.CharField(max_length=50, null=True, blank=True)
    intents = models.JSONField(default=dict, blank=True)  # {intent: count}
    
    # Customer preferences
    language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, null=True, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    
    # Metadata
    first_message_at = models.DateTimeField(null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "WhatsApp Conversation"
        verbose_name_plural = "WhatsApp Conversations"
        ordering = ['-last_message_at']
    
    def __str__(self):
        return f"{self.customer_name or self.phone_number} ({self.message_count} messages)"


class WhatsAppWebhook(models.Model):
    """Log all webhook events for debugging and analytics"""
    
    EVENT_TYPE_CHOICES = [
        ('message_received', 'Message Received'),
        ('message_sent', 'Message Sent'),
        ('delivery_report', 'Delivery Report'),
        ('read_report', 'Read Report'),
        ('verification', 'Webhook Verification'),
        ('error', 'Error Event'),
    ]
    
    # Event identification
    webhook_id = models.CharField(max_length=100, unique=True, db_index=True)
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES)
    
    # Provider info
    provider = models.CharField(max_length=50)  # wasender, twilio, etc
    
    # Payload
    raw_payload = models.JSONField()
    parsed_data = models.JSONField(default=dict, blank=True)
    
    # Status
    processed = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    
    # Related message
    message = models.ForeignKey(
        WhatsAppMessage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='webhooks'
    )
    
    # Timestamp
    received_at = models.DateTimeField(auto_now_add=True, db_index=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "WhatsApp Webhook"
        verbose_name_plural = "WhatsApp Webhooks"
        ordering = ['-received_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.provider} ({self.received_at})"


class WhatsAppTemplate(models.Model):
    """Store predefined message templates for campaigns"""
    
    CATEGORY_CHOICES = [
        ('greeting', 'Greeting'),
        ('faq', 'FAQ'),
        ('promotional', 'Promotional'),
        ('booking', 'Booking'),
        ('feedback', 'Feedback'),
        ('reminder', 'Reminder'),
        ('custom', 'Custom'),
    ]
    
    # Template info
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Template content
    template_text = models.TextField()
    variables = models.JSONField(default=list, blank=True)  # [{name, description}]
    
    # Metadata
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    use_count = models.IntegerField(default=0)
    success_rate = models.FloatField(default=0.0)  # Percentage
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "WhatsApp Template"
        verbose_name_plural = "WhatsApp Templates"
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"[{self.category}] {self.name}"


class WhatsAppCampaign(models.Model):
    """Track bulk message campaigns"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('paused', 'Paused'),
    ]
    
    # Campaign info
    campaign_id = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    
    # Template
    template = models.ForeignKey(
        WhatsAppTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    custom_message = models.TextField(null=True, blank=True)
    
    # Target
    target_count = models.IntegerField()
    success_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Configuration
    delay_between_messages = models.IntegerField(default=3)  # seconds
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "WhatsApp Campaign"
        verbose_name_plural = "WhatsApp Campaigns"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.status})"


class WhatsAppAnalytics(models.Model):
    """Daily analytics for WhatsApp messages"""
    
    # Date
    date = models.DateField(unique=True, db_index=True)
    
    # Volume metrics
    total_incoming = models.IntegerField(default=0)
    total_outgoing = models.IntegerField(default=0)
    total_conversations = models.IntegerField(default=0)
    new_conversations = models.IntegerField(default=0)
    
    # Response metrics
    avg_response_time_ms = models.IntegerField(default=0)
    auto_reply_count = models.IntegerField(default=0)
    
    # Delivery metrics
    sent_count = models.IntegerField(default=0)
    delivered_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    read_count = models.IntegerField(default=0)
    
    # Intent distribution
    intent_distribution = models.JSONField(default=dict, blank=True)
    
    # Cost
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "WhatsApp Analytics"
        verbose_name_plural = "WhatsApp Analytics"
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics - {self.date}"


# ============================================================
# MANAGER METHODS (Custom queries)
# ============================================================

class WhatsAppMessageManager(models.Manager):
    """Custom manager for WhatsAppMessage"""
    
    def by_phone(self, phone):
        """Get all messages for a phone number"""
        return self.filter(phone_number=phone).order_by('-created_at')
    
    def incoming(self):
        """Get only incoming messages"""
        return self.filter(direction='incoming')
    
    def outgoing(self):
        """Get only outgoing messages"""
        return self.filter(direction='outgoing')
    
    def undelivered(self):
        """Get messages that haven't been delivered"""
        return self.exclude(status__in=['delivered', 'read'])
    
    def today(self):
        """Get messages from today"""
        today = timezone.now().date()
        return self.filter(created_at__date=today)


# Add custom manager to model:
# objects = WhatsAppMessageManager()


# ============================================================
# USAGE EXAMPLES
# ============================================================

"""
# Create a message
msg = WhatsAppMessage.objects.create(
    message_id="msg_123",
    phone_number="919876543210",
    message_type="text",
    message_text="How much is Everest?",
    direction="incoming"
)

# Update status
msg.status = "delivered"
msg.save()

# Get conversation
convo = WhatsAppConversation.objects.get(phone_number="919876543210")
print(f"Messages: {convo.message_count}")

# Analytics query
from django.db.models import Count, Avg
from datetime import date

daily_stats = WhatsAppMessage.objects.filter(
    created_at__date=date.today()
).aggregate(
    total=Count('id'),
    outgoing=Count('id', filter=models.Q(direction='outgoing'))
)
print(f"Today: {daily_stats['outgoing']} messages sent")

# Get templates by category
templates = WhatsAppTemplate.objects.filter(category='faq', is_active=True)
for template in templates:
    print(f"- {template.name}")

# Track campaign
campaign = WhatsAppCampaign.objects.create(
    campaign_id="camp_456",
    name="Everest Promotion",
    target_count=1000,
    custom_message="Join Everest trek!"
)
campaign.status = "running"
campaign.save()
"""

# ============================================================
# DJANGO ADMIN CONFIGURATION
# ============================================================

"""
Add to admin.py:

from django.contrib import admin
from .models import (
    WhatsAppMessage,
    WhatsAppConversation,
    WhatsAppWebhook,
    WhatsAppTemplate,
    WhatsAppCampaign,
    WhatsAppAnalytics
)

@admin.register(WhatsAppMessage)
class WhatsAppMessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'phone_number', 'direction', 'status', 'created_at')
    list_filter = ('direction', 'status', 'message_type', 'created_at')
    search_fields = ('message_id', 'phone_number', 'message_text')
    readonly_fields = ('message_id', 'created_at')

@admin.register(WhatsAppConversation)
class WhatsAppConversationAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'customer_name', 'message_count', 'primary_intent', 'status')
    list_filter = ('status', 'created_at')
    search_fields = ('phone_number', 'customer_name')

@admin.register(WhatsAppTemplate)
class WhatsAppTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'use_count', 'success_rate', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'template_text')

@admin.register(WhatsAppCampaign)
class WhatsAppCampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'target_count', 'success_count', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'campaign_id')
"""
