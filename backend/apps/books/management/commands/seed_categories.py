"""
Management Command: seed_categories
=====================================
Seeds the initial set of curated categories into the database.
Run once after first migration: python manage.py seed_categories
"""

from django.core.management.base import BaseCommand
from apps.books.models import Category


INITIAL_CATEGORIES = [
    # ── Curated (Special) ─────────────────────────────────────────────
    {
        'name': 'New Reader',
        'slug': 'new-reader',
        'description': 'Perfect books to start your reading journey. Short, engaging, and life-changing.',
        'category_type': 'curated',
        'icon': '🌱',
        'color': '#22c55e',
        'is_featured': True,
        'sort_order': 1,
    },
    {
        'name': 'Trending Now',
        'slug': 'trending',
        'description': 'Books everyone is talking about right now.',
        'category_type': 'curated',
        'icon': '🔥',
        'color': '#ef4444',
        'is_featured': True,
        'sort_order': 2,
    },
    {
        'name': 'Editor\'s Picks',
        'slug': 'editors-picks',
        'description': 'Hand-curated selection of must-read books by our editorial team.',
        'category_type': 'curated',
        'icon': '⭐',
        'color': '#f59e0b',
        'is_featured': True,
        'sort_order': 3,
    },

    # ── Motivational / Self-Help ──────────────────────────────────────
    {
        'name': 'Motivational',
        'slug': 'motivational',
        'description': 'Books that inspire you to take action and live your best life.',
        'category_type': 'genre',
        'icon': '💪',
        'color': '#8b5cf6',
        'is_featured': True,
        'sort_order': 4,
    },
    {
        'name': 'Self Help',
        'slug': 'self-help',
        'description': 'Practical guides for personal growth and development.',
        'category_type': 'genre',
        'icon': '🧠',
        'color': '#6366f1',
        'is_featured': True,
        'sort_order': 5,
    },

    # ── Finance & Business ────────────────────────────────────────────
    {
        'name': 'Finance',
        'slug': 'finance',
        'description': 'Master money, investing, and financial independence.',
        'category_type': 'genre',
        'icon': '💰',
        'color': '#10b981',
        'is_featured': True,
        'sort_order': 6,
    },
    {
        'name': 'Business',
        'slug': 'business',
        'description': 'Entrepreneurship, management, and business strategy.',
        'category_type': 'genre',
        'icon': '💼',
        'color': '#3b82f6',
        'is_featured': True,
        'sort_order': 7,
    },
    {
        'name': 'Startups',
        'slug': 'startups',
        'description': 'Build, launch, and scale your startup.',
        'category_type': 'genre',
        'icon': '🚀',
        'color': '#f97316',
        'is_featured': False,
        'sort_order': 8,
    },

    # ── Fiction ───────────────────────────────────────────────────────
    {
        'name': 'Fiction',
        'slug': 'fiction',
        'description': 'Novels, short stories, and literary fiction.',
        'category_type': 'genre',
        'icon': '📚',
        'color': '#ec4899',
        'is_featured': True,
        'sort_order': 9,
    },
    {
        'name': 'Mystery & Thriller',
        'slug': 'mystery-thriller',
        'description': 'Suspense, crime, and page-turning thrillers.',
        'category_type': 'genre',
        'icon': '🔍',
        'color': '#1e293b',
        'is_featured': False,
        'sort_order': 10,
    },
    {
        'name': 'Science Fiction',
        'slug': 'science-fiction',
        'description': 'Explore the future, space, and alternate realities.',
        'category_type': 'genre',
        'icon': '🛸',
        'color': '#06b6d4',
        'is_featured': False,
        'sort_order': 11,
    },
    {
        'name': 'Fantasy',
        'slug': 'fantasy',
        'description': 'Magic, mythical worlds, and epic adventures.',
        'category_type': 'genre',
        'icon': '🧙',
        'color': '#7c3aed',
        'is_featured': False,
        'sort_order': 12,
    },
    {
        'name': 'Romance',
        'slug': 'romance',
        'description': 'Love stories and romantic fiction.',
        'category_type': 'genre',
        'icon': '❤️',
        'color': '#f43f5e',
        'is_featured': False,
        'sort_order': 13,
    },

    # ── Non-Fiction ───────────────────────────────────────────────────
    {
        'name': 'Biography',
        'slug': 'biography',
        'description': 'Life stories of inspiring people.',
        'category_type': 'genre',
        'icon': '👤',
        'color': '#78716c',
        'is_featured': False,
        'sort_order': 14,
    },
    {
        'name': 'History',
        'slug': 'history',
        'description': 'Understand the world through its past.',
        'category_type': 'genre',
        'icon': '🏛️',
        'color': '#92400e',
        'is_featured': False,
        'sort_order': 15,
    },
    {
        'name': 'Science',
        'slug': 'science',
        'description': 'Explore the natural world and scientific discoveries.',
        'category_type': 'genre',
        'icon': '🔬',
        'color': '#0891b2',
        'is_featured': False,
        'sort_order': 16,
    },
    {
        'name': 'Psychology',
        'slug': 'psychology',
        'description': 'Understand the human mind and behavior.',
        'category_type': 'genre',
        'icon': '🧩',
        'color': '#d946ef',
        'is_featured': False,
        'sort_order': 17,
    },
    {
        'name': 'Health & Wellness',
        'slug': 'health-wellness',
        'description': 'Physical and mental health, nutrition, and well-being.',
        'category_type': 'genre',
        'icon': '🌿',
        'color': '#16a34a',
        'is_featured': False,
        'sort_order': 18,
    },
    {
        'name': 'Spiritual',
        'slug': 'spiritual',
        'description': 'Philosophy, mindfulness, and spiritual growth.',
        'category_type': 'genre',
        'icon': '☮️',
        'color': '#a78bfa',
        'is_featured': False,
        'sort_order': 19,
    },
    {
        'name': 'Technology',
        'slug': 'technology',
        'description': 'AI, software, and the digital future.',
        'category_type': 'genre',
        'icon': '💻',
        'color': '#1d4ed8',
        'is_featured': False,
        'sort_order': 20,
    },

    # ── By Publisher ──────────────────────────────────────────────────
    {
        'name': 'Penguin Books',
        'slug': 'penguin',
        'description': 'Classic and contemporary titles from Penguin.',
        'category_type': 'publisher',
        'icon': '🐧',
        'color': '#f97316',
        'is_featured': False,
        'sort_order': 30,
    },
    {
        'name': 'HarperCollins',
        'slug': 'harpercollins',
        'description': 'Bestsellers and award winners from HarperCollins.',
        'category_type': 'publisher',
        'icon': '📖',
        'color': '#dc2626',
        'is_featured': False,
        'sort_order': 31,
    },
    {
        'name': 'Random House',
        'slug': 'random-house',
        'description': 'World-class literature from Random House.',
        'category_type': 'publisher',
        'icon': '🏠',
        'color': '#2563eb',
        'is_featured': False,
        'sort_order': 32,
    },
]


class Command(BaseCommand):
    help = 'Seeds initial categories into the database'

    def handle(self, *args, **options):
        created_count = 0
        for cat_data in INITIAL_CATEGORIES:
            _, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {cat_data["name"]}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Done! Created {created_count} categories ({len(INITIAL_CATEGORIES) - created_count} already existed).'
            )
        )
