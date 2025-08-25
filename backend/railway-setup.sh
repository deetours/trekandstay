#!/bin/bash
# Railway deployment script

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files (if needed)
python manage.py collectstatic --noinput

# Seed initial data
python manage.py seed_message_templates
python manage.py bootstrap_demo

# Build embeddings (initial)
python manage.py build_embeddings

echo "Django setup complete!"
