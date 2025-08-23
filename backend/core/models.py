from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]
    SOURCE_CHOICES = [
        ('web', 'Web'),
        ('whatsapp', 'WhatsApp'),
        ('phone', 'Phone'),
        ('other', 'Other'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)
    # New fields for WhatsApp Leads and attribution
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='web')
    is_whatsapp = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    # Trip association optional
    # Defined later after Trip model declaration via string reference
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Phase 1 Lead Management extensions
    STAGE_CHOICES = [
        ('new', 'New'),
        ('engaged', 'Engaged'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('advance_paid', 'Advance Paid'),
        ('balance_due', 'Balance Due'),
        ('completed', 'Completed'),
        ('lost', 'Lost'),
    ]
    stage = models.CharField(max_length=32, choices=STAGE_CHOICES, default='new', db_index=True)
    intent_score = models.PositiveSmallIntegerField(default=0)
    last_contact_at = models.DateTimeField(null=True, blank=True)
    next_action_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_leads')
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def touch_contact(self):
        self.last_contact_at = timezone.now()
        self.save(update_fields=['last_contact_at'])

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reward_points = models.IntegerField(default=0)
    preferences = models.JSONField(default=dict, blank=True)

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=255)
    date = models.DateField()
    status = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    # New fields for structured linkage & payment split
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    seats = models.PositiveIntegerField(default=1)
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class TripHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=255)
    date = models.DateField()
    feedback = models.TextField(blank=True)

class TripRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    destination = models.CharField(max_length=255)
    reason = models.CharField(max_length=255)
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='recommendations')

# New: Payment model for UPI
class Payment(models.Model):
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    merchant_vpa = models.CharField(max_length=120, default='trekandstay@ybl')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    upi_txn_id = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Payment #{self.id} for Booking #{self.booking_id} - {self.status}"

# --- New domain models ---
class Guide(models.Model):
    name = models.CharField(max_length=120)
    bio = models.TextField(blank=True)
    image = models.URLField(blank=True)
    specialty = models.CharField(max_length=120, blank=True)
    experience = models.CharField(max_length=120, blank=True)

    def __str__(self) -> str:
        return self.name

class Trip(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    images = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=200)
    duration = models.CharField(max_length=120, blank=True)
    spots_available = models.PositiveIntegerField(default=0)
    next_departure = models.DateField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    safety_record = models.CharField(max_length=200, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    equipment = models.JSONField(default=list, blank=True)
    essentials = models.JSONField(default=list, blank=True)
    guide = models.ForeignKey(Guide, on_delete=models.SET_NULL, null=True, blank=True, related_name='trips')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name

# New SeatLock model for server-side seat reservation
class SeatLock(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('released', 'Released'),
    ]
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='seat_locks')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='seat_locks')
    seats = models.PositiveIntegerField()
    expires_at = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['trip', 'status']),
        ]

    def is_expired(self):
        return timezone.now() >= self.expires_at or self.status == 'expired'

    def mark_expired(self):
        if self.status == 'active' and timezone.now() >= self.expires_at:
            self.status = 'expired'
            self.save(update_fields=['status'])
            # return seats to trip
            try:
                self.trip.spots_available = models.F('spots_available') + self.seats
                self.trip.save(update_fields=['spots_available'])
            except Exception:
                pass

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(rating__gte=1, rating__lte=5), name='review_rating_between_1_and_5'),
        ]

# --- Stories Platform Models ---
class Author(models.Model):
    name = models.CharField(max_length=120)
    whatsapp = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name

class Story(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='stories')
    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    text = models.TextField()
    # Moderation fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    rejection_reason = models.CharField(max_length=255, blank=True)
    version = models.PositiveIntegerField(default=1)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_stories')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.title} - {self.destination}"

class StoryImage(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='image_items')
    url = models.URLField()
    public_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class StoryAudio(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='audio_items')
    url = models.URLField()
    public_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class StoryRating(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='ratings')
    value = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(value__gte=1, value__lte=5), name='rating_between_1_and_5')
        ]

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE, related_name='wishlisted_by')
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'trip')

    def __str__(self) -> str:
        return f"{self.user.username} → {self.trip.name}"

class ChatFAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.question[:60]

# --- New Embedding model for semantic retrieval ---
class Embedding(models.Model):
    OBJECT_TYPES = [
        ('trip', 'Trip'),
        ('story', 'Story'),
        ('faq', 'FAQ'),
    ]
    object_type = models.CharField(max_length=10, choices=OBJECT_TYPES)
    object_id = models.PositiveIntegerField()
    text = models.TextField()  # source text chunk
    vector = models.JSONField()  # list of floats
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('object_type', 'object_id')
        indexes = [
            models.Index(fields=['object_type', 'object_id']),
        ]

    def __str__(self):
        return f"Embedding {self.object_type}:{self.object_id}"

# --- Phase 1 New Messaging / Automation Models ---
class MessageTemplate(models.Model):
    CATEGORY_CHOICES = [
        ('utility', 'Utility'),
        ('reminder', 'Reminder'),
        ('marketing', 'Marketing'),
    ]
    name = models.CharField(max_length=120, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='utility')
    body = models.TextField(help_text="Use {{variable}} placeholders")
    variables = models.JSONField(default=list, blank=True, help_text='List of variable names used')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class LeadEvent(models.Model):
    TYPE_CHOICES = [
        ('inbound_msg', 'Inbound Message'),
        ('outbound_msg', 'Outbound Message'),
        ('status_change', 'Status Change'),
        ('payment', 'Payment'),
        ('note', 'Note'),
        ('system', 'System'),
    ]
    CHANNEL_CHOICES = [
        ('custom_whatsapp', 'Custom WhatsApp'),
    ]
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='events')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    channel = models.CharField(max_length=32, choices=CHANNEL_CHOICES, default='custom_whatsapp')
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class OutboundMessage(models.Model):
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='outbound_messages', null=True, blank=True)
    to = models.CharField(max_length=32, db_index=True)
    template = models.ForeignKey(MessageTemplate, null=True, blank=True, on_delete=models.SET_NULL, related_name='messages')
    rendered_body = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='queued', db_index=True)
    retries = models.PositiveSmallIntegerField(default=0)
    scheduled_for = models.DateTimeField(null=True, blank=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'scheduled_for']),
        ]

    def __str__(self):
        return f"Msg {self.id} -> {self.to} [{self.status}]"

# --- Phase B Task / lightweight CRM model ---
class Task(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('done', 'Done'),
        ('canceled', 'Canceled'),
    ]
    TYPE_CHOICES = [
        ('initial_contact', 'Initial Contact'),
        ('follow_up', 'Follow Up'),
        ('abandoned_reengage', 'Abandoned Re-engage'),
    ]
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='tasks')
    type = models.CharField(max_length=40, choices=TYPE_CHOICES, default='follow_up', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', db_index=True)
    title = models.CharField(max_length=200, default='Follow up')
    notes = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    owner = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'due_at']),
            models.Index(fields=['lead', 'status']),
        ]

    def mark_done(self):
        if self.status != 'done':
            from django.utils import timezone
            self.status = 'done'
            self.completed_at = timezone.now()
            self.save(update_fields=['status', 'completed_at'])

    def __str__(self):
        return f"Task {self.id} {self.type} ({self.status})"
