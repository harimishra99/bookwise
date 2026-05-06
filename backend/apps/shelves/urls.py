"""Shelves App — URL Routes"""
from django.urls import path
from .views import MyShelvesView, ShelfDetailView, ShelfBooksView, AddBookToShelfView

urlpatterns = [
    path('', MyShelvesView.as_view(), name='shelf-list'),
    path('<int:pk>/', ShelfDetailView.as_view(), name='shelf-detail'),
    path('<int:pk>/books/', ShelfBooksView.as_view(), name='shelf-books'),
    path('<int:pk>/books/<slug:book_slug>/', AddBookToShelfView.as_view(), name='shelf-add-book'),
]
