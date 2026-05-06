"""
Users App — Views
=================
Handles user profile retrieval and updates.
"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import User
from .serializers import UserPrivateSerializer, UserPublicSerializer, UserUpdateSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/users/me/  — Get current user's full profile
    PATCH /api/v1/users/me/ — Update current user's profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserUpdateSerializer
        return UserPrivateSerializer

    def get_object(self):
        # Update last_seen on every profile fetch
        user = self.request.user
        user.last_seen = timezone.now()
        user.save(update_fields=['last_seen'])
        return user


class UserPublicProfileView(generics.RetrieveAPIView):
    """
    GET /api/v1/users/<id>/ — Get any user's public profile
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.AllowAny]
