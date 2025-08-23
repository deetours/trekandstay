from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from core.models import Trip, Booking, OutboundMessage, LeadEvent, MessageTemplate
from decimal import Decimal

class Command(BaseCommand):
    help = 'Demonstrate booking creation -> outbound message queue -> process queue'

    def add_arguments(self, parser):
        parser.add_argument('--username', default='demo')
        parser.add_argument('--trip', help='Trip name to use or create', default='Demo Trek')
        parser.add_argument('--price', type=Decimal, default=Decimal('9999.00'))

    def handle(self, *args, **opts):
        user, _ = User.objects.get_or_create(username=opts['username'])
        trip, _ = Trip.objects.get_or_create(name=opts['trip'], defaults={'description':'Demo trip','location':'Demo','price':opts['price']})
        booking = Booking.objects.create(user=user, destination=trip.name, date=timezone.now().date(), status='pending', amount=trip.price, trip=trip, seats=1, advance_amount=trip.price*Decimal('0.3'), balance_amount=trip.price*Decimal('0.7'))
        self.stdout.write(self.style.SUCCESS(f'Created booking #{booking.id}'))
        # check outbound messages
        msgs = OutboundMessage.objects.filter(rendered_body__icontains=f'Booking #{booking.id}')
        self.stdout.write(f'Outbound queued: {msgs.count()}')
        for m in msgs:
            self.stdout.write(f'- Msg {m.id} status={m.status} body={m.rendered_body[:80]}')
        self.stdout.write('Run: manage.py process_outbound_messages then re-run this command to see status change.')
