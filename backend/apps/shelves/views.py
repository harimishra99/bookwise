"""
Shelves App — Views, Serializers, URLs
=======================================
Manages user bookshelves and reading lists.
"""

# ── serializers.py content ────────────────────────────────────────────────────

from rest_framework import serializers, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.db.models import F
from .models import Shelf, ShelfBook
from apps.books.models import Book
from apps.books.serializers import BookListSerializer


class ShelfBookSerializer(serializers.ModelSerializer):
    book = BookListSerializer(read_only=True)

    class Meta:
        model = ShelfBook
        fields = ['id', 'book', 'notes', 'date_added', 'date_finished']


class ShelfSerializer(serializers.ModelSerializer):
    books_count = serializers.SerializerMethodField()
    recent_books = serializers.SerializerMethodField()

    class Meta:
        model = Shelf
        fields = ['id', 'name', 'slug', 'description', 'is_default',
                  'is_public', 'books_count', 'recent_books', 'created_at']
        read_only_fields = ['slug', 'is_default', 'created_at']

    def get_books_count(self, obj):
        return obj.books.count()

    def get_recent_books(self, obj):
        """Return last 4 books for shelf preview."""
        recent = ShelfBook.objects.filter(shelf=obj).select_related('book')[:4]
        return [{'cover': sb.book.cover_image_m, 'title': sb.book.title} for sb in recent]


# ── views.py content ─────────────────────────────────────────────────────────

class MyShelvesView(generics.ListCreateAPIView):
    """
    GET  /api/v1/shelves/       — Get all of the current user's shelves
    POST /api/v1/shelves/       — Create a new custom shelf
    """
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        name = serializer.validated_data['name']
        shelf = serializer.save(
            user=self.request.user,
            slug=slugify(name),
            is_default=False
        )


class ShelfDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/shelves/<id>/  — Get shelf with books
    PUT    /api/v1/shelves/<id>/  — Rename / update shelf
    DELETE /api/v1/shelves/<id>/  — Delete shelf (not default shelves)
    """
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        shelf = self.get_object()
        if shelf.is_default:
            return Response(
                {'error': 'Cannot delete default shelves.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class ShelfBooksView(generics.ListAPIView):
    """
    GET /api/v1/shelves/<id>/books/ — Get all books in a shelf
    """
    serializer_class = ShelfBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        shelf = get_object_or_404(Shelf, id=self.kwargs['pk'], user=self.request.user)
        return ShelfBook.objects.filter(shelf=shelf).select_related('book')


class AddBookToShelfView(APIView):
    """
    POST   /api/v1/shelves/<id>/books/<book_slug>/ — Add book to shelf
    DELETE /api/v1/shelves/<id>/books/<book_slug>/ — Remove book from shelf
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, book_slug):
        shelf = get_object_or_404(Shelf, id=pk, user=request.user)
        book = get_object_or_404(Book, slug=book_slug)
        notes = request.data.get('notes', '')

        obj, created = ShelfBook.objects.get_or_create(
            shelf=shelf, book=book,
            defaults={'notes': notes}
        )

        if not created:
            return Response({'message': 'Book already in shelf.'}, status=status.HTTP_200_OK)

        # Increment book saves count
        Book.objects.filter(pk=book.pk).update(saves_count=F('saves_count') + 1)

        # If adding to 'read' shelf, increment user's books_read_count
        if shelf.slug == 'read':
            from apps.users.models import User
            User.objects.filter(pk=request.user.pk).update(books_read_count=F('books_read_count') + 1)

        return Response({'message': 'Book added to shelf.'}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, book_slug):
        shelf = get_object_or_404(Shelf, id=pk, user=request.user)
        book = get_object_or_404(Book, slug=book_slug)
        deleted, _ = ShelfBook.objects.filter(shelf=shelf, book=book).delete()
        if deleted:
            Book.objects.filter(pk=book.pk).update(saves_count=F('saves_count') - 1)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── urls.py content ───────────────────────────────────────────────────────────

from django.urls import path

urlpatterns = [
    path('', MyShelvesView.as_view(), name='shelf-list'),
    path('<int:pk>/', ShelfDetailView.as_view(), name='shelf-detail'),
    path('<int:pk>/books/', ShelfBooksView.as_view(), name='shelf-books'),
    path('<int:pk>/books/<slug:book_slug>/', AddBookToShelfView.as_view(), name='shelf-add-book'),
]
