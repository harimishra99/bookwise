"""
Books App — Views
=================
Handles book listing, search, detail, reviews, and categories.
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F
from .models import Book, Category, Review, ReviewHelpful
from .serializers import (
    BookListSerializer, BookDetailSerializer,
    CategorySerializer, ReviewSerializer, ReviewWriteSerializer
)
from .filters import BookFilter
from .services import OpenLibraryService


# ─────────────────────────────────────────────
# CATEGORY VIEWS
# ─────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    """
    GET /api/v1/books/categories/
    Returns all categories. Frontend uses this to build nav & filter UI.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class FeaturedCategoriesView(generics.ListAPIView):
    """
    GET /api/v1/books/categories/featured/
    Returns featured categories for homepage display.
    """
    queryset = Category.objects.filter(is_featured=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# ─────────────────────────────────────────────
# BOOK VIEWS
# ─────────────────────────────────────────────

class BookListView(generics.ListAPIView):
    """
    GET /api/v1/books/
    Full-text search + filtering.
    Query params:
      - search: full-text search on title/author
      - category: filter by category slug
      - language: filter by language code (en, hi, etc.)
      - year_from / year_to: publication year range
      - min_rating: minimum average rating
      - ordering: title, -average_rating, -trending_score, publish_year
    """
    queryset = Book.objects.filter(is_verified=True).prefetch_related('categories')
    serializer_class = BookListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BookFilter
    search_fields = ['title', 'authors', 'publisher', 'subjects']
    ordering_fields = ['title', 'average_rating', 'trending_score', 'publish_year', 'ratings_count']
    ordering = ['-trending_score']


class TrendingBooksView(generics.ListAPIView):
    """
    GET /api/v1/books/trending/
    Returns top trending books (sorted by trending_score).
    trending_score is computed weekly via a management command.
    """
    queryset = Book.objects.filter(is_verified=True).order_by('-trending_score')[:50]
    serializer_class = BookListSerializer
    permission_classes = [permissions.AllowAny]


class FeaturedBooksView(generics.ListAPIView):
    """
    GET /api/v1/books/featured/
    Editor's picks — books manually flagged as featured.
    """
    queryset = Book.objects.filter(is_featured=True, is_verified=True)
    serializer_class = BookListSerializer
    permission_classes = [permissions.AllowAny]


class NewReleasesView(generics.ListAPIView):
    """
    GET /api/v1/books/new-releases/
    Books published in the last 2 years, sorted by recency.
    """
    from django.utils import timezone
    current_year = timezone.now().year
    queryset = Book.objects.filter(
        is_verified=True,
        publish_year__gte=current_year - 2
    ).order_by('-publish_year', '-trending_score')
    serializer_class = BookListSerializer
    permission_classes = [permissions.AllowAny]


class BooksByCategoryView(generics.ListAPIView):
    """
    GET /api/v1/books/category/<slug>/
    Returns books in a specific category.
    """
    serializer_class = BookListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['average_rating', 'trending_score', 'publish_year']
    ordering = ['-trending_score']

    def get_queryset(self):
        slug = self.kwargs['slug']
        return Book.objects.filter(
            categories__slug=slug,
            is_verified=True
        ).prefetch_related('categories')


class BookDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/books/<slug>/
    Returns full book details + increments view count.
    """
    queryset = Book.objects.filter(is_verified=True).prefetch_related('categories')
    serializer_class = BookDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count without loading full model
        Book.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ─────────────────────────────────────────────
# REVIEW VIEWS
# ─────────────────────────────────────────────

class BookReviewsView(generics.ListCreateAPIView):
    """
    GET  /api/v1/books/<slug>/reviews/ — List all reviews for a book
    POST /api/v1/books/<slug>/reviews/ — Submit a new review (auth required)
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_book(self):
        return Book.objects.get(slug=self.kwargs['slug'])

    def get_queryset(self):
        book = self.get_book()
        return Review.objects.filter(book=book).select_related('user')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewWriteSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        book = self.get_book()
        review = serializer.save(user=self.request.user, book=book)

        # Update book's rating stats
        reviews = Review.objects.filter(book=book)
        count = reviews.count()
        avg = sum(r.rating for r in reviews) / count if count > 0 else 0
        Book.objects.filter(pk=book.pk).update(
            average_rating=round(avg, 2),
            ratings_count=count,
            reviews_count=count,
        )

        # Update user's review count
        from apps.users.models import User
        User.objects.filter(pk=self.request.user.pk).update(
            reviews_count=F('reviews_count') + 1
        )


class ReviewHelpfulView(APIView):
    """
    POST /api/v1/reviews/<id>/helpful/
    Toggle a review as helpful (like an upvote).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        review = Review.objects.get(pk=pk)
        obj, created = ReviewHelpful.objects.get_or_create(
            user=request.user, review=review
        )
        if not created:
            # Already marked — toggle off (un-helpful)
            obj.delete()
            Review.objects.filter(pk=pk).update(helpful_count=F('helpful_count') - 1)
            return Response({'status': 'removed'})
        else:
            Review.objects.filter(pk=pk).update(helpful_count=F('helpful_count') + 1)
            return Response({'status': 'added'}, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────
# OPEN LIBRARY SEARCH (Live API passthrough)
# ─────────────────────────────────────────────

class OpenLibrarySearchView(APIView):
    """
    GET /api/v1/books/search-external/?q=<query>
    Searches Open Library API live (for books not yet in our DB).
    Results are NOT saved to DB here — that happens when a user saves a book.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response({'error': 'Query too short'}, status=400)

        service = OpenLibraryService()
        results = service.search_books(query, limit=20)
        return Response(results)
