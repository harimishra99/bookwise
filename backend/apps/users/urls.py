"""Users App — URL Routes"""
from django.urls import path
from .views import MeView, UserPublicProfileView

urlpatterns = [
    path('me/', MeView.as_view(), name='user-me'),
    path('<int:pk>/', UserPublicProfileView.as_view(), name='user-profile'),
]
