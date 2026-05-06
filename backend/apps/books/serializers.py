"""
Books App — Serializers
=======================
Serializes Book, Category, and Review data for the API.
"""

from rest_framework import serializers
from .models import Book, Category, Review
from apps.users.serializers import UserPublicSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'category_type',
            'icon', 'cover_image', 'color', 'is_featured', 'book_count',
        ]


class BookListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (search results, trending, etc.)."""

    authors_display = serializers.ReadOnlyField()
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'slug', 'title', 'subtitle', 'authors', 'authors_display',
            'publisher', 'publish_year', 'cover_image', 'cover_image_m',
            'average_rating', 'ratings_count', 'reviews_count',
            'categories', 'trending_score', 'is_featured',
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    """Full serializer for book detail page."""

    authors_display = serializers.ReadOnlyField()
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'slug', 'title', 'subtitle', 'authors', 'authors_display',
            'publisher', 'publish_date', 'publish_year', 'language', 'page_count',
            'description', 'subjects', 'cover_image', 'cover_image_m', 'cover_image_s',
            'average_rating', 'ratings_count', 'reviews_count',
            'categories', 'trending_score', 'is_featured',
            'open_library_id', 'isbn_10', 'isbn_13',
            'views_count', 'saves_count', 'created_at',
        ]


class ReviewSerializer(serializers.ModelSerializer):
    """Review with user info — for displaying reviews on book pages."""

    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'rating', 'title', 'body', 'is_spoiler',
            'helpful_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['helpful_count', 'created_at', 'updated_at']


class ReviewWriteSerializer(serializers.ModelSerializer):
    """Used for creating/updating reviews — user is inferred from request."""

    class Meta:
        model = Review
        fields = ['rating', 'title', 'body', 'is_spoiler']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
