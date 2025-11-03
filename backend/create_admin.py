#!/usr/bin/env python
"""
Create admin user for Django
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from django.contrib.auth.models import User

print("=" * 80)
print("🔑 ADMIN USER SETUP")
print("=" * 80)
print()

# Check if admin exists
admin = User.objects.filter(username='admin').first()

if admin:
    print(f"✅ Admin user already exists!")
    print(f"   Username: {admin.username}")
    print(f"   Email: {admin.email}")
    print(f"   ID: {admin.id}")
else:
    # Create admin user
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@trek-and-stay.com',
        password='Admin@12345'
    )
    print(f"✅ Created new admin user!")
    print(f"   Username: admin")
    print(f"   Email: admin@trek-and-stay.com")
    print(f"   Password: Admin@12345")
    print(f"   ID: {admin.id}")

print()

# List all admin/staff users
staff_users = User.objects.filter(is_staff=True)
print(f"✅ Total Staff/Admin Users: {staff_users.count()}")
print()

for user in staff_users:
    status = "🔑 SuperUser" if user.is_superuser else "👤 Staff"
    print(f"   {status}: {user.username} (ID: {user.id})")

print()
print("=" * 80)
print("✅ ADMIN ACCESS READY!")
print("=" * 80)
print()
print("Admin Panel: http://localhost:8000/admin/")
print("Username: admin")
print("Password: Admin@12345")
print()
