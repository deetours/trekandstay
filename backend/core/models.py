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

# Enhanced: Payment model for UPI with verification & risk tracking
class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),           # Awaiting user UPI payment
        ('initiated', 'Initiated'),       # User initiated payment
        ('waiting', 'Waiting'),           # Waiting for manual verification
        ('verified', 'Verified'),         # Manually verified by admin
        ('confirmed', 'Confirmed'),       # Booking confirmed
        ('failed', 'Failed'),             # Payment failed
        ('expired', 'Expired'),           # Payment window expired (24hrs)
        ('disputed', 'Disputed'),         # Transaction disputed
    ]
    VERIFICATION_STATUS = [
        ('pending', 'Pending Manual Review'),
        ('verified', 'Payment Verified'),
        ('rejected', 'Payment Rejected'),
        ('auto_verified', 'Auto Verified'),
    ]
    RISK_LEVEL = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('fraud', 'Suspected Fraud'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    merchant_vpa = models.CharField(max_length=120, default='trekandstay@ybl')
    
    # UPI Transaction Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    upi_txn_id = models.CharField(max_length=120, blank=True, db_index=True)  # Unique identifier for UPI txn
    customer_vpa = models.CharField(max_length=120, blank=True)  # Customer's UPI ID
    
    # Verification fields
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    verified_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='verified_payments')
    verification_notes = models.TextField(blank=True)
    verification_timestamp = models.DateTimeField(null=True, blank=True)
    
    # Risk Assessment
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL, default='low')
    risk_flags = models.JSONField(default=list, blank=True)  # List of risk indicators
    risk_score = models.PositiveIntegerField(default=0)  # 0-100 score
    
    # Timing & Expiry
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    payment_initiated_at = models.DateTimeField(null=True, blank=True)  # When user clicked pay
    payment_confirmed_at = models.DateTimeField(null=True, blank=True)  # When payment confirmed
    expires_at = models.DateTimeField(null=True, blank=True)  # 24 hour expiry from creation
    
    # Booking confirmation
    booking_confirmed = models.BooleanField(default=False)
    confirmation_email_sent = models.BooleanField(default=False)
    confirmation_whatsapp_sent = models.BooleanField(default=False)
    
    # Additional verification data
    reference_number = models.CharField(max_length=50, unique=True, db_index=True)  # TAS{timestamp}
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['booking', 'status']),
        ]

    def __str__(self) -> str:
        return f"Payment #{self.id} ({self.reference_number}) - {self.status}"
    
    def is_expired(self):
        """Check if payment window has expired (24 hours)"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def calculate_risk_score(self):
        """Calculate risk score based on multiple factors"""
        score = 0
        flags = []
        
        # Amount checks
        if self.amount > 100000:
            score += 20
            flags.append('high_amount')
        if self.amount < 100:
            score += 10
            flags.append('suspiciously_low')
        
        # Timing checks
        if self.payment_initiated_at:
            time_diff = (timezone.now() - self.payment_initiated_at).total_seconds() / 60
            if time_diff > 60:  # More than 1 hour to complete
                score += 15
                flags.append('delayed_completion')
        
        # Multiple attempts
        past_payments = Payment.objects.filter(
            booking=self.booking,
            created_at__gte=timezone.now() - timezone.timedelta(hours=24)
        ).exclude(id=self.id)
        if past_payments.count() >= 2:
            score += 25
            flags.append('multiple_attempts')
        
        # VPA checks (simple fraud detection)
        if self.customer_vpa:
            # Flag if using suspicious VPAs
            suspicious_patterns = ['test', 'fraud', 'spam', 'xxx']
            if any(pattern in self.customer_vpa.lower() for pattern in suspicious_patterns):
                score += 30
                flags.append('suspicious_vpa')
        
        self.risk_score = min(score, 100)
        self.risk_flags = flags
        
        # Set risk level based on score
        if score >= 70:
            self.risk_level = 'fraud'
        elif score >= 50:
            self.risk_level = 'high'
        elif score >= 20:
            self.risk_level = 'medium'
        else:
            self.risk_level = 'low'

# New: Payment Verification Log - track all verification attempts
class PaymentVerificationLog(models.Model):
    VERIFICATION_METHOD = [
        ('manual', 'Manual Review'),
        ('auto_scan', 'Auto Scan'),
        ('user_proof', 'User Screenshot'),
        ('bank_api', 'Bank API'),
        ('sms_confirmation', 'SMS Confirmation'),
    ]
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='verification_logs')
    method = models.CharField(max_length=20, choices=VERIFICATION_METHOD, default='manual')
    status = models.CharField(max_length=20, choices=Payment.VERIFICATION_STATUS)
    notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    proof_document = models.URLField(blank=True)  # Screenshot/proof link
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.payment.reference_number} - {self.method} - {self.status}"

# New: Transaction tracking for audit trail
class TransactionAudit(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='audit_trail')
    event_type = models.CharField(max_length=50)  # 'created', 'status_changed', 'verified', 'booked'
    old_value = models.CharField(max_length=50, blank=True)
    new_value = models.CharField(max_length=50, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.payment.reference_number} - {self.event_type}"

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


# ==============================
# GAMIFICATION MODELS
# ==============================

class UserProgress(models.Model):
    """Track user points, levels, and achievements"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    
    # Points & Level
    points = models.PositiveIntegerField(default=0, db_index=True)
    level = models.PositiveIntegerField(default=1)
    total_earned_points = models.PositiveIntegerField(default=0)  # All-time total
    
    # Streaks & Engagement
    daily_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Counts
    total_bookings = models.PositiveIntegerField(default=0)
    total_trip_views = models.PositiveIntegerField(default=0)
    total_shares = models.PositiveIntegerField(default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Badges (JSON array of badge IDs)
    badges = models.JSONField(default=list, blank=True)  # ['explorer', 'early-bird', ...]
    
    # Completed challenges
    completed_challenges = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'User Progress'
        ordering = ['-points']
        indexes = [
            models.Index(fields=['-points']),
            models.Index(fields=['level']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.points} pts)"
    
    def calculate_level(self):
        """Recalculate level based on points"""
        # Level thresholds
        thresholds = [0, 100, 300, 600, 1000, 2000, 5000]
        for i, threshold in enumerate(thresholds):
            if self.points < threshold:
                return i if i > 0 else 1
        return len(thresholds)
    
    def add_points(self, amount: int, reason: str = ''):
        """Award points and create audit trail"""
        self.points += amount
        self.total_earned_points += amount
        
        # Check level up
        old_level = self.level
        self.level = self.calculate_level()
        self.updated_at = timezone.now()
        self.save()
        
        # Log the transaction
        PointTransaction.objects.create(
            user=self.user,
            points=amount,
            reason=reason,
            from_level=old_level,
            to_level=self.level
        )
        
        return old_level < self.level  # Return True if leveled up
    
    def unlock_badge(self, badge_id: str):
        """Unlock a new badge"""
        if badge_id not in self.badges:
            self.badges.append(badge_id)
            self.save(update_fields=['badges'])
            
            # Create badge unlock record
            BadgeUnlock.objects.create(
                user=self.user,
                badge_id=badge_id
            )


class PointTransaction(models.Model):
    """Audit trail for all point awards"""
    REASON_CHOICES = [
        ('trip_view', 'Trip View'),
        ('booking_completed', 'Booking Completed'),
        ('review_written', 'Review Written'),
        ('trip_shared', 'Trip Shared'),
        ('referral', 'Referral Bonus'),
        ('challenge_completed', 'Challenge Completed'),
        ('manual_award', 'Manual Award'),
        ('manual_deduct', 'Manual Deduction'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='point_transactions')
    points = models.IntegerField()  # Can be negative
    reason = models.CharField(max_length=50, choices=REASON_CHOICES, default='manual_award')
    from_level = models.PositiveIntegerField()
    to_level = models.PositiveIntegerField()
    metadata = models.JSONField(default=dict, blank=True)  # Extra context
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Point Transactions'
    
    def __str__(self):
        return f"{self.user.username} +{self.points} ({self.reason})"


class Badge(models.Model):
    """Achievement badges"""
    id = models.CharField(max_length=50, primary_key=True)  # 'explorer', 'early-bird', etc.
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon_name = models.CharField(max_length=50)  # Lucide icon name
    points_reward = models.PositiveIntegerField()
    
    # Unlock condition
    unlock_condition = models.CharField(max_length=255)  # 'visited_5_trips', 'booked_10_times', etc.
    
    category = models.CharField(max_length=50)  # 'achievement', 'milestone', 'challenge'
    rarity = models.CharField(
        max_length=20,
        choices=[('common', 'Common'), ('rare', 'Rare'), ('epic', 'Epic'), ('legendary', 'Legendary')],
        default='common'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Badges'
    
    def __str__(self):
        return f"{self.name} ({self.rarity})"


class BadgeUnlock(models.Model):
    """Track when badges are unlocked"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badge_unlocks')
    badge_id = models.CharField(max_length=50)
    unlocked_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        unique_together = ('user', 'badge_id')
        verbose_name_plural = 'Badge Unlocks'
    
    def __str__(self):
        return f"{self.user.username} unlocked {self.badge_id}"


class GamificationEvent(models.Model):
    """Track all gamification-relevant events"""
    EVENT_TYPES = [
        ('trip_view', 'Trip View'),
        ('trip_bookmark', 'Trip Bookmark'),
        ('booking_started', 'Booking Started'),
        ('booking_completed', 'Booking Completed'),
        ('review_written', 'Review Written'),
        ('trip_shared', 'Trip Shared'),
        ('referral_sent', 'Referral Sent'),
        ('daily_login', 'Daily Login'),
        ('lead_submitted', 'Lead Submitted'),
        ('challenge_completed', 'Challenge Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gamification_events', null=True, blank=True)
    guest_id = models.CharField(max_length=100, blank=True)  # For tracking non-logged-in users
    
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    trip = models.ForeignKey('Trip', on_delete=models.SET_NULL, null=True, blank=True)
    booking = models.ForeignKey('Booking', on_delete=models.SET_NULL, null=True, blank=True)
    
    points_awarded = models.PositiveIntegerField(default=0)
    badges_unlocked = models.JSONField(default=list, blank=True)
    
    metadata = models.JSONField(default=dict, blank=True)  # Custom context
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['event_type', '-created_at']),
        ]
    
    def __str__(self):
        user_str = self.user.username if self.user else f"guest_{self.guest_id}"
        return f"{user_str} - {self.event_type}"


class Challenge(models.Model):
    """Weekly/Monthly challenges for users"""
    id = models.CharField(max_length=50, primary_key=True)  # 'weekend-warrior', etc.
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    reward_points = models.PositiveIntegerField()
    icon_name = models.CharField(max_length=50)  # Lucide icon name
    
    # Challenge rules
    event_type = models.CharField(max_length=50, choices=GamificationEvent.EVENT_TYPES)
    target_count = models.PositiveIntegerField(default=1)  # How many times event needs to happen
    
    # Duration
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    
    # Metadata
    difficulty = models.CharField(
        max_length=20,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='medium'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Challenges'
        ordering = ['ends_at']
    
    def __str__(self):
        return f"{self.name} ({self.event_type})"


class UserChallengeProgress(models.Model):
    """Track user progress on challenges"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenge_progress')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    
    current_progress = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    reward_claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'challenge')
        verbose_name_plural = 'User Challenge Progress'
    
    def __str__(self):
        return f"{self.user.username} - {self.challenge.name}: {self.current_progress}/{self.challenge.target_count}"


# ==================== LEAD QUALIFICATION SYSTEM ====================

class LeadQualificationScore(models.Model):
    """Calculate and store lead qualification score"""
    QUALIFICATION_STATUS = [
        ('hot', 'Hot'),      # Highly qualified (75-100)
        ('warm', 'Warm'),    # Moderately qualified (40-74)
        ('cold', 'Cold'),    # Low qualification (0-39)
        ('disqualified', 'Disqualified'),
    ]
    
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name='qualification_score')
    
    # Score components (0-25 each = 100 total)
    engagement_score = models.PositiveSmallIntegerField(default=0)  # 0-25
    intent_score = models.PositiveSmallIntegerField(default=0)      # 0-25
    fit_score = models.PositiveSmallIntegerField(default=0)         # 0-25
    urgency_score = models.PositiveSmallIntegerField(default=0)     # 0-25
    
    # Total qualification score
    total_score = models.PositiveSmallIntegerField(default=0)  # 0-100
    qualification_status = models.CharField(max_length=20, choices=QUALIFICATION_STATUS, default='cold')
    
    # Scoring metadata
    last_scored_at = models.DateTimeField(auto_now=True)
    scoring_reason = models.TextField(blank=True)  # Why this score was given
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def calculate_score(self):
        """Recalculate lead score based on engagement and behavior"""
        # Engagement: activity, contact frequency, response time
        if self.lead.last_contact_at:
            days_since_contact = (timezone.now() - self.lead.last_contact_at).days
            self.engagement_score = max(0, 25 - (days_since_contact * 2))
        
        # Intent: trip views, booking attempts, wishlist
        event_count = LeadEvent.objects.filter(lead=self.lead, event_type__in=['trip_view', 'booking_attempt']).count()
        self.intent_score = min(25, event_count * 3)
        
        # Fit: matches with available trips, preferences
        self.fit_score = 15  # Default moderate fit
        if self.lead.metadata.get('preferred_difficulty'):
            self.fit_score = 20
        if self.lead.metadata.get('preferred_price_range'):
            self.fit_score = min(25, self.fit_score + 5)
        
        # Urgency: booking date, trip departure date
        if self.lead.metadata.get('booking_date'):
            days_to_trip = (self.lead.metadata.get('booking_date') - timezone.now().date()).days
            self.urgency_score = min(25, max(0, 25 - days_to_trip))
        
        # Calculate total
        self.total_score = (self.engagement_score + self.intent_score + 
                           self.fit_score + self.urgency_score)
        
        # Determine status
        if self.total_score >= 75:
            self.qualification_status = 'hot'
        elif self.total_score >= 40:
            self.qualification_status = 'warm'
        else:
            self.qualification_status = 'cold'
        
        self.save()
        return self.total_score
    
    def __str__(self):
        return f"{self.lead.name} - {self.qualification_status.upper()} ({self.total_score}pts)"


class LeadQualificationRule(models.Model):
    """Define rules for lead qualification"""
    RULE_TYPES = [
        ('engagement', 'Engagement Rule'),
        ('intent', 'Intent Rule'),
        ('fit', 'Fit Rule'),
        ('urgency', 'Urgency Rule'),
        ('custom', 'Custom Rule'),
    ]
    
    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    
    # Rule condition JSON format: {'field': 'value', 'operator': 'gt', 'threshold': 5}
    condition = models.JSONField()
    points_value = models.PositiveSmallIntegerField(default=0)  # Points to add if rule matches
    
    is_active = models.BooleanField(default=True)
    priority = models.PositiveSmallIntegerField(default=0)  # Higher = executed first
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.rule_type}) - {self.points_value}pts"


class LeadPrioritizationQueue(models.Model):
    """Queue leads for sales team follow-up in priority order"""
    PRIORITY_LEVELS = [
        (1, 'Critical'),
        (2, 'High'),
        (3, 'Medium'),
        (4, 'Low'),
    ]
    
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name='priority_queue')
    
    priority_level = models.PositiveSmallIntegerField(choices=PRIORITY_LEVELS, default=4)
    queue_position = models.PositiveIntegerField(default=0)
    
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='priority_queue_leads')
    assigned_at = models.DateTimeField(null=True, blank=True)
    
    follow_up_date = models.DateTimeField(null=True, blank=True)
    last_follow_up = models.DateTimeField(null=True, blank=True)
    follow_up_count = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_status = models.CharField(
        max_length=20, 
        choices=[('converted', 'Converted'), ('lost', 'Lost'), ('pending', 'Pending')],
        default='pending'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['priority_level', 'queue_position', '-created_at']
    
    def __str__(self):
        return f"{self.lead.name} - Priority {self.priority_level} (Queue: {self.queue_position})"
