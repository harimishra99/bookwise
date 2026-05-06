"""
Shelves App — Models
====================
User reading shelves: Want to Read, Currently Reading, Read.
Also handles custom shelves (like Goodreads lists).
"""

from django.db import models
from apps.users.models import User
from apps.books.models import Book


class Shelf(models.Model):
    """
    A named collection of books belonging to a user.
    Default shelves: 'want-to-read', 'reading', 'read'.
    Users can also create custom shelves.
    """

    DEFAULT_SHELVES = [
        ('want-to-read', 'Want to Read'),
        ('reading', 'Currently Reading'),
        ('read', 'Read'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shelves')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True, max_length=300)
    is_default = models.BooleanField(default=False)  # Default shelves can't be deleted
    is_public = models.BooleanField(default=True)    # Public shelves visible on profile
    books = models.ManyToManyField(Book, through='ShelfBook', related_name='shelves')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shelves'
        unique_together = ['user', 'slug']
        ordering = ['is_default', '-created_at']

    def __str__(self):
        return f"{self.user.display_name} → {self.name}"


class ShelfBook(models.Model):
    """
    Through model for Shelf ↔ Book.
    Stores when a book was added and optional notes.
    """
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    notes = models.TextField(blank=True, max_length=500)  # Personal reading notes
    date_added = models.DateTimeField(auto_now_add=True)
    date_finished = models.DateField(null=True, blank=True)  # When they finished reading

    class Meta:
        db_table = 'shelf_books'
        unique_together = ['shelf', 'book']
        ordering = ['-date_added']
