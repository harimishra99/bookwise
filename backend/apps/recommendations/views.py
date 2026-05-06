"""
Recommendations App — Models, Views, URLs
==========================================
Simple collaborative filtering + content-based recommendations.
Logic: Find books similar to what the user has read / saved.
"""

from django.db import models
from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.books.models import Book, Category
from apps.books.serializers import BookListSerializer
from apps.users.models import User


# ── Views ─────────────────────────────────────────────────────────────────────

class PersonalizedRecommendationsView(APIView):
    """
    GET /api/v1/recommendations/
    Returns personalized book recommendations for the logged-in user.

    Algorithm:
    1. Get user's preferred genres from profile
    2. Get categories from books they've shelved
    3. Find highly-rated books in those categories they haven't read
    4. If not enough data, fall back to trending books
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        limit = int(request.query_params.get('limit', 20))

        # Get books the user has already shelved (to exclude from recommendations)
        from apps.shelves.models import ShelfBook
        shelved_book_ids = ShelfBook.objects.filter(
            shelf__user=user
        ).values_list('book_id', flat=True)

        # Start with user's preferred genres
        preferred_genres = user.preferred_genres or []
        category_slugs = list(preferred_genres)

        # Also infer genres from shelved books
        if shelved_book_ids:
            inferred_categories = Category.objects.filter(
                books__id__in=shelved_book_ids
            ).values_list('slug', flat=True).distinct()
            category_slugs.extend(list(inferred_categories))

        # Deduplicate
        category_slugs = list(set(category_slugs))

        recommendations = []

        if category_slugs:
            # Find top-rated books in preferred categories that user hasn't shelved
            recommendations = list(
                Book.objects.filter(
                    categories__slug__in=category_slugs,
                    is_verified=True,
                    average_rating__gte=3.5,
                )
                .exclude(id__in=shelved_book_ids)
                .prefetch_related('categories')
                .order_by('-average_rating', '-trending_score')
                .distinct()[:limit]
            )

        # Pad with trending books if not enough recommendations
        if len(recommendations) < limit:
            trending = Book.objects.filter(
                is_verified=True
            ).exclude(
                id__in=shelved_book_ids
            ).exclude(
                id__in=[b.id for b in recommendations]
            ).order_by('-trending_score')[:limit - len(recommendations)]
            recommendations.extend(list(trending))

        serializer = BookListSerializer(recommendations, many=True)
        return Response({
            'personalized': bool(category_slugs),  # Tell frontend if these are personalized
            'books': serializer.data,
        })


class SimilarBooksView(APIView):
    """
    GET /api/v1/recommendations/similar/<book_slug>/
    Returns books similar to a given book.
    Based on shared categories and subjects.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, book_slug):
        try:
            book = Book.objects.get(slug=book_slug)
        except Book.DoesNotExist:
            return Response({'books': []})

        # Find books in the same categories, excluding the book itself
        category_ids = book.categories.values_list('id', flat=True)
        similar = Book.objects.filter(
            categories__id__in=category_ids,
            is_verified=True,
        ).exclude(pk=book.pk).order_by('-average_rating', '-trending_score').distinct()[:12]

        serializer = BookListSerializer(similar, many=True)
        return Response({'books': serializer.data})


class AuthorBooksView(APIView):
    """
    GET /api/v1/recommendations/by-author/?author=<name>
    Returns other books by the same author(s).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        author = request.query_params.get('author', '')
        if not author:
            return Response({'books': []})

        books = Book.objects.filter(
            authors__icontains=author,
            is_verified=True,
        ).order_by('-average_rating')[:12]

        serializer = BookListSerializer(books, many=True)
        return Response({'books': serializer.data})


# ── URLs ──────────────────────────────────────────────────────────────────────

urlpatterns = [
    path('', PersonalizedRecommendationsView.as_view(), name='recommendations'),
    path('similar/<slug:book_slug>/', SimilarBooksView.as_view(), name='similar-books'),
    path('by-author/', AuthorBooksView.as_view(), name='author-books'),
]
