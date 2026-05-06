"""
Users App — Serializers
=======================
Handles serialization/deserialization of User data for the API.
"""

from rest_framework import serializers
from .models import User


class UserPublicSerializer(serializers.ModelSerializer):
    """Public user profile — safe to expose to other users."""

    display_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'display_name', 'avatar', 'bio',
            'reader_type', 'books_read_count', 'reviews_count',
            'date_joined',
        ]


class UserPrivateSerializer(serializers.ModelSerializer):
    """Private user profile — only visible to the user themselves."""

    display_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'display_name', 'avatar',
            'bio', 'reader_type', 'preferred_genres', 'preferred_languages',
            'books_read_count', 'reviews_count', 'date_joined', 'last_seen',
        ]
        read_only_fields = ['email', 'books_read_count', 'reviews_count', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/v1/users/me/ — update profile."""

    class Meta:
        model = User
        fields = [
            'full_name', 'avatar', 'bio',
            'reader_type', 'preferred_genres', 'preferred_languages',
        ]
