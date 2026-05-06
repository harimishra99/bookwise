from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.users.social_views import GoogleLogin

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),

    # Google OAuth
    path('auth/social/google/', GoogleLogin.as_view(), name='google-login'),

    # App APIs
    path('users/', include('apps.users.urls')),
    path('books/', include('apps.books.urls')),
    path('shelves/', include('apps.shelves.urls')),
    path('recommendations/', include('apps.recommendations.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)