# ── filters.py ───────────────────────────────────────────────────────────────
"""
BookFilter — Django Filter backend for /api/v1/books/
Supports filtering by category, language, year range, rating.
"""
import django_filters
from .models import Book


class BookFilter(django_filters.FilterSet):
    # Filter by category slug (e.g. ?category=self-help)
    category = django_filters.CharFilter(field_name='categories__slug', lookup_expr='iexact')
    # Year range (e.g. ?year_from=2018&year_to=2023)
    year_from = django_filters.NumberFilter(field_name='publish_year', lookup_expr='gte')
    year_to = django_filters.NumberFilter(field_name='publish_year', lookup_expr='lte')
    # Minimum rating (e.g. ?min_rating=4)
    min_rating = django_filters.NumberFilter(field_name='average_rating', lookup_expr='gte')
    # Language (e.g. ?language=en)
    language = django_filters.CharFilter(field_name='language', lookup_expr='iexact')
    # Publisher (e.g. ?publisher=Penguin)
    publisher = django_filters.CharFilter(field_name='publisher', lookup_expr='icontains')

    class Meta:
        model = Book
        fields = ['category', 'language', 'year_from', 'year_to', 'min_rating', 'publisher']
