from django.urls import path
from .views import PersonalizedRecommendationsView, SimilarBooksView, AuthorBooksView
from .ai_views import AIRecommendationView

urlpatterns = [
    path('', PersonalizedRecommendationsView.as_view(), name='recommendations'),
    path('similar/<slug:book_slug>/', SimilarBooksView.as_view(), name='similar-books'),
    path('by-author/', AuthorBooksView.as_view(), name='author-books'),
    path('ai/', AIRecommendationView.as_view(), name='ai-recommendations'),
]
