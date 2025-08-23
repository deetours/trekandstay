from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from core.models import Trip

class Command(BaseCommand):
    help = "Bootstrap demo user, token, one trip and output curl commands"

    def handle(self, *args, **options):
        U = get_user_model()
        user, created = U.objects.get_or_create(username='demo', defaults={'email': 'demo@example.com'})
        user.set_password('demo12345')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        trip, t_created = Trip.objects.get_or_create(
            name='Demo Trek',
            defaults={'location': 'Demo Hills', 'price': 1500, 'spots_available': 10}
        )
        if not t_created:
            # ensure values
            trip.location = 'Demo Hills'
            trip.price = 1500
            trip.spots_available = 10 if trip.spots_available < 1 else trip.spots_available
            trip.save()
        self.stdout.write('\n=== DEMO BOOTSTRAP COMPLETE ===')
        self.stdout.write(f'User: demo  Password: demo12345  Token: {token.key}')
        self.stdout.write(f'Trip id: {trip.id}')
        self.stdout.write('\nNow run these commands (PowerShell):')
        self.stdout.write(f'$TOKEN="{token.key}"')
        self.stdout.write('curl.exe -H "Authorization: Token $TOKEN" http://127.0.0.1:8000/api/trips/')
        self.stdout.write(f'curl.exe -v -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" --data "{{\"trip\":{trip.id},\"date\":\"2025-09-01\",\"seats\":1}}" http://127.0.0.1:8000/api/bookings/')
        self.stdout.write('\nExpect 201 Created and DEBUG lines in server log.')
