# Django Backend Setup Instructions

## Current Issue
The seat locking system requires the Django backend API to be running, but it's not starting due to missing dependencies.

## Quick Fix Steps:

### 1. Install Missing Dependencies
```bash
cd backend
pip install -r requirements.txt
# OR install individually:
pip install django djangorestframework django-cors-headers
pip install cloudinary sentence-transformers
pip install python-dotenv
```

### 2. Database Setup (if needed)
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Start Backend Server
```bash
python manage.py runserver
```
This should start the API at http://localhost:8000

### 4. Verify Seat Lock API
Test the endpoints:
- POST /api/seatlocks/acquire/ (with trip ID and seats)
- POST /api/seatlocks/{id}/refresh/
- POST /api/seatlocks/{id}/release/

## Alternative: Mock Implementation
If backend setup is problematic, we can temporarily modify the frontend to use mock seat locking for development.

## Seat Lock Flow:
1. User selects trip details → Click Continue
2. Frontend calls `acquireSeatLock(tripId, seats)`
3. Backend creates SeatLock record with 5-minute expiry
4. Frontend shows countdown timer
5. User completes booking or lock expires
6. Backend either converts lock to booking or releases seats
