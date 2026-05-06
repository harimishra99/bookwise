from django.urls import path
from .views import PersonalizedRecommendationsView, SimilarBooksView, AuthorBooksView

urlpatterns = [
    path('', PersonalizedRecommendationsView.as_view(), name='recommendations'),
    path('similar/<slug:book_slug>/', SimilarBooksView.as_view(), name='similar-books'),
    path('by-author/', AuthorBooksView.as_view(), name='author-books'),
]
