# Generated manually for booking enhancements

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_booking_advance_amount_booking_balance_amount_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add max_capacity and status fields to Trip model
        migrations.AddField(
            model_name='trip',
            name='max_capacity',
            field=models.PositiveIntegerField(default=5),
        ),
        migrations.AddField(
            model_name='trip',
            name='status',
            field=models.CharField(choices=[('available', 'Available'), ('promoted', 'Promoted'), ('full', 'Full')], db_index=True, default='available', max_length=20),
        ),
        # Create BookingLimit model
        migrations.CreateModel(
            name='BookingLimit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_bookings', models.PositiveIntegerField(default=0)),
                ('max_allowed', models.PositiveIntegerField(default=3)),
                ('last_booking_date', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='booking_limit', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]