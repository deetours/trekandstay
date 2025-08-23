from django.db import migrations, models
import django.db.models.deletion


def backfill_booking_amounts(apps, schema_editor):
    Booking = apps.get_model('core', 'Booking')
    Trip = apps.get_model('core', 'Trip')
    for b in Booking.objects.all():
        # Attempt to associate trip by matching name to destination
        if not b.trip_id:
            trip = Trip.objects.filter(name=b.destination).first()
            if trip:
                b.trip_id = trip.id
        # Compute advance/balance if zero
        if (b.advance_amount == 0 and b.balance_amount == 0) and b.amount:
            advance = round(float(b.amount) * 0.3, 2)
            balance = round(float(b.amount) - advance, 2)
            b.advance_amount = advance
            b.balance_amount = balance
        b.save(update_fields=['trip', 'advance_amount', 'balance_amount'])


def backfill_reverse(apps, schema_editor):
    # No reverse backfill necessary
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_story_approved_at_story_approved_by_and_more'),
    ]

    # All structural changes already exist in 0001_initial; retain only backfill if needed.
    operations = [
        migrations.RunPython(backfill_booking_amounts, backfill_reverse),
    ]
