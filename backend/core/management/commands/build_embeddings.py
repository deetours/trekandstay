from django.core.management.base import BaseCommand
from core.embeddings import build_all_embeddings

class Command(BaseCommand):
    help = "Build or rebuild semantic embeddings for trips, stories, and FAQs"

    def handle(self, *args, **options):
        count = build_all_embeddings()
        self.stdout.write(self.style.SUCCESS(f"Built embeddings for {count} objects"))
