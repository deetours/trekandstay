"""
Django management command to score leads using ML model
Usage: python manage.py score_leads [--all] [--lead-id=<id>] [--batch-size=<size>]
"""

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from core.models import Lead, LeadQualificationScore
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../..'))
from ml_models.lead_scoring_model import LeadScoringModel
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Score leads using machine learning model'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Score all leads in the database',
        )
        parser.add_argument(
            '--lead-id',
            type=int,
            help='Score a specific lead by ID',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=50,
            help='Batch size for processing (default: 50)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-scoring of already scored leads',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually scoring',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🤖 Lead Scoring Management Command')
        )
        self.stdout.write('=' * 50)

        # Initialize ML model
        model = LeadScoringModel()
        model_loaded = model.load_model()

        if not model_loaded:
            raise CommandError(
                '❌ ML model not found. Please train the model first using: '
                'python ml_models/lead_scoring_model.py'
            )

        # Determine which leads to score
        if options['lead_id']:
            try:
                leads = [Lead.objects.get(id=options['lead_id'])]
                self.stdout.write(f'Targeting lead ID: {options["lead_id"]}')
            except Lead.DoesNotExist:
                raise CommandError(f'Lead with ID {options["lead_id"]} not found')
        elif options['all']:
            leads = Lead.objects.all().order_by('-created_at')
            self.stdout.write(f'Targeting all {leads.count()} leads')
        else:
            # Score leads created in the last 24 hours by default
            yesterday = timezone.now() - timezone.timedelta(days=1)
            leads = Lead.objects.filter(created_at__gte=yesterday).order_by('-created_at')
            self.stdout.write(f'Targeting {leads.count()} leads from last 24 hours')

        if not options['force']:
            # Exclude already scored leads (unless force is used)
            already_scored_ids = set(
                LeadQualificationScore.objects.values_list('lead_id', flat=True)
            )
            leads = [lead for lead in leads if lead.id not in already_scored_ids]
            self.stdout.write(f'Filtered to {len(leads)} unscored leads')

        if not leads:
            self.stdout.write(self.style.WARNING('No leads to score'))
            return

        if options['dry_run']:
            self.stdout.write(f'🔍 DRY RUN: Would score {len(leads)} leads')
            for i, lead in enumerate(leads[:5]):  # Show first 5
                self.stdout.write(f'  {i+1}. {lead.name} ({lead.email or lead.phone})')
            if len(leads) > 5:
                self.stdout.write(f'  ... and {len(leads)-5} more')
            return

        # Score leads in batches
        batch_size = options['batch_size']
        total_scored = 0
        total_errors = 0

        self.stdout.write(f'🚀 Starting to score {len(leads)} leads in batches of {batch_size}')

        for i in range(0, len(leads), batch_size):
            batch = leads[i:i+batch_size]
            batch_number = (i // batch_size) + 1
            total_batches = (len(leads) + batch_size - 1) // batch_size

            self.stdout.write(f'📦 Processing batch {batch_number}/{total_batches} ({len(batch)} leads)')

            for lead in batch:
                try:
                    # Score the lead
                    score = model.predict_probability(lead)

                    # Save or update qualification score
                    qual_score, created = LeadQualificationScore.objects.get_or_create(
                        lead=lead,
                        defaults={
                            'engagement_score': 0,
                            'intent_score': 0,
                            'fit_score': 0,
                            'urgency_score': 0,
                            'total_score': score,
                            'qualification_status': self._get_status_from_score(score),
                            'scoring_reason': 'ML model prediction'
                        }
                    )

                    if not created:
                        # Update existing score
                        qual_score.total_score = score
                        qual_score.qualification_status = self._get_status_from_score(score)
                        qual_score.scoring_reason = 'ML model re-scoring'
                        qual_score.save()

                    total_scored += 1

                    # Progress indicator
                    if total_scored % 10 == 0:
                        self.stdout.write(f'  ✅ Scored {total_scored}/{len(leads)} leads')

                except Exception as e:
                    logger.error(f'Error scoring lead {lead.id}: {str(e)}')
                    total_errors += 1
                    continue

        # Summary
        self.stdout.write(self.style.SUCCESS('🎯 Scoring Complete!'))
        self.stdout.write(f'  ✅ Successfully scored: {total_scored} leads')
        if total_errors > 0:
            self.stdout.write(self.style.WARNING(f'  ❌ Errors: {total_errors} leads'))

        # Show score distribution
        if total_scored > 0:
            self._show_score_distribution()

    def _get_status_from_score(self, score):
        """Convert numeric score to qualification status"""
        if score >= 75:
            return 'hot'
        elif score >= 40:
            return 'warm'
        else:
            return 'cold'

    def _show_score_distribution(self):
        """Show distribution of scores"""
        self.stdout.write('\n📊 Score Distribution:')

        # Get recent scores
        recent_scores = LeadQualificationScore.objects.filter(
            last_scored_at__gte=timezone.now() - timezone.timedelta(hours=1)
        )

        if recent_scores.exists():
            distribution = {
                'hot': recent_scores.filter(qualification_status='hot').count(),
                'warm': recent_scores.filter(qualification_status='warm').count(),
                'cold': recent_scores.filter(qualification_status='cold').count(),
                'disqualified': recent_scores.filter(qualification_status='disqualified').count(),
            }

            total = sum(distribution.values())
            for status, count in distribution.items():
                percentage = (count / total * 100) if total > 0 else 0
                self.stdout.write(f'  {status.upper()}: {count} ({percentage:.1f}%)')