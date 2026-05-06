"""Books App — URL Routes"""
from django.urls import path
from .views import (
    CategoryListView, FeaturedCategoriesView,
    BookListView, TrendingBooksView, FeaturedBooksView,
    NewReleasesView, BooksByCategoryView, BookDetailView,
    BookReviewsView, ReviewHelpfulView, OpenLibrarySearchView,
)

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/featured/', FeaturedCategoriesView.as_view(), name='featured-categories'),

    # Book lists
    path('', BookListView.as_view(), name='book-list'),
    path('trending/', TrendingBooksView.as_view(), name='trending-books'),
    path('featured/', FeaturedBooksView.as_view(), name='featured-books'),
    path('new-releases/', NewReleasesView.as_view(), name='new-releases'),
    path('category/<slug:slug>/', BooksByCategoryView.as_view(), name='books-by-category'),

    # External search (Open Library passthrough)
    path('search-external/', OpenLibrarySearchView.as_view(), name='open-library-search'),

    # Book detail
    path('<slug:slug>/', BookDetailView.as_view(), name='book-detail'),

    # Reviews
    path('<slug:slug>/reviews/', BookReviewsView.as_view(), name='book-reviews'),
    path('reviews/<int:pk>/helpful/', ReviewHelpfulView.as_view(), name='review-helpful'),
]
