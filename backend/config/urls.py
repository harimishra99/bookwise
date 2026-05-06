from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.users.social_views import GoogleLogin

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),

    # Google OAuth — custom view, no allauth dependency
    path('api/v1/auth/social/google/', GoogleLogin.as_view(), name='google-login'),

    # App APIs
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/books/', include('apps.books.urls')),
    path('api/v1/shelves/', include('apps.shelves.urls')),
    path('api/v1/recommendations/', include('apps.recommendations.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)