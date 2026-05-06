import requests
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class GoogleLogin(APIView):
    """
    Custom Google OAuth login.
    Receives access_token from frontend, fetches user info
    directly from Google, creates/gets user, returns JWT tokens.
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        access_token = request.data.get('access_token')

        if not access_token:
            return Response(
                {'error': 'access_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch user info directly from Google using the access token
        google_response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if google_response.status_code != 200:
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        google_data = google_response.json()

        email = google_data.get('email')
        name = google_data.get('name', '')
        picture = google_data.get('picture', '')
        google_id = google_data.get('sub')  # Google's unique user ID

        if not email:
            return Response(
                {'error': 'Could not get email from Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create the user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': name,
                'avatar': picture,
                'google_id': google_id,
                'is_active': True,
            }
        )

        # Update avatar and name if user already exists
        if not created:
            user.avatar = picture
            if not user.full_name:
                user.full_name = name
            user.save(update_fields=['avatar', 'full_name'])

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'avatar': user.avatar,
                'display_name': user.display_name,
            }
        }, status=status.HTTP_200_OK)