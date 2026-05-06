"""
Management Command: sync_trending_books
=======================================
Run this weekly via cron or Vercel cron jobs to keep trending data fresh.
Usage: python manage.py sync_trending_books

Schedule: Add to Vercel cron or use a task queue (Celery/Dramatiq).
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from apps.books.models import Book, Category
from apps.books.services import OpenLibraryService
from django.utils.text import slugify
import time


class Command(BaseCommand):
    help = 'Sync trending books from Open Library API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--period',
            type=str,
            default='weekly',
            choices=['daily', 'weekly', 'monthly', 'yearly'],
            help='Trending period to fetch'
        )

    def handle(self, *args, **options):
        period = options['period']
        self.stdout.write(f'Syncing {period} trending books from Open Library...')

        service = OpenLibraryService()
        trending_books = service.get_trending_books(period=period, limit=100)

        if not trending_books:
            self.stdout.write(self.style.ERROR('No trending books returned from API'))
            return

        synced, created = 0, 0

        for i, book_data in enumerate(trending_books):
            olid = book_data.get('open_library_id', '')
            if not olid:
                continue

            try:
                with transaction.atomic():
                    # Calculate trending score based on position (1st = highest score)
                    trending_score = len(trending_books) - i

                    book, was_created = Book.objects.update_or_create(
                        open_library_id=olid,
                        defaults={
                            'title': book_data['title'] or 'Unknown Title',
                            'authors': book_data['authors'] or [],
                            'publisher': book_data['publisher'] or '',
                            'publish_year': book_data['publish_year'],
                            'language': book_data.get('language', 'en'),
                            'page_count': book_data.get('page_count'),
                            'subjects': book_data.get('subjects', []),
                            'cover_image': book_data['cover_image'],
                            'cover_image_m': book_data['cover_image_m'],
                            'cover_image_s': book_data['cover_image_s'],
                            'trending_score': trending_score,
                        }
                    )

                    if was_created:
                        created += 1
                    synced += 1

                # Be polite to the API
                time.sleep(0.1)

            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Error syncing {olid}: {e}'))
                continue

        self.stdout.write(
            self.style.SUCCESS(
                f'Done! Synced {synced} books ({created} new) from {period} trending.'
            )
        )
