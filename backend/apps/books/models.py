"""
Books App — Models
==================
Core models for books, categories, and reviews.
Books are fetched from Open Library API and cached in our DB.
"""

from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User


# ─────────────────────────────────────────────
# CATEGORY MODEL
# ─────────────────────────────────────────────

class Category(models.Model):
    """
    Book categories/genres.
    Some are curated (New Reader, Motivational, Finance) and
    some are auto-created from Open Library subjects.
    """

    CATEGORY_TYPES = [
        ('curated', 'Curated'),       # Handpicked categories like "New Reader"
        ('genre', 'Genre'),           # Fiction, Non-fiction, etc.
        ('publisher', 'Publisher'),   # By publication house
        ('subject', 'Subject'),       # Auto-imported from Open Library
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='genre')
    icon = models.CharField(max_length=10, blank=True)  # Emoji icon for UI display
    cover_image = models.URLField(blank=True)           # Banner image for category page
    color = models.CharField(max_length=7, blank=True)  # Hex color for UI theming
    is_featured = models.BooleanField(default=False)    # Show on homepage
    sort_order = models.PositiveIntegerField(default=0) # Controls display order
    book_count = models.PositiveIntegerField(default=0) # Denormalized for performance
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        # Auto-generate slug from name
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# BOOK MODEL
# ─────────────────────────────────────────────

class Book(models.Model):
    """
    Main book model. Data is synced from Open Library API.
    open_library_id is the canonical identifier (e.g., OL12345W).
    """

    # ── External IDs ─────────────────────────────────────────────
    open_library_id = models.CharField(max_length=50, unique=True, blank=True)
    isbn_10 = models.CharField(max_length=10, blank=True)
    isbn_13 = models.CharField(max_length=13, blank=True)
    google_books_id = models.CharField(max_length=50, blank=True)

    # ── Core Book Info ───────────────────────────────────────────
    title = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, unique=True, blank=True)
    subtitle = models.CharField(max_length=500, blank=True)
    authors = models.JSONField(default=list)         # ["Author Name", ...]
    publisher = models.CharField(max_length=200, blank=True)
    publish_date = models.CharField(max_length=50, blank=True)  # "2021", "January 2021", etc.
    publish_year = models.IntegerField(null=True, blank=True)   # Extracted year for filtering
    language = models.CharField(max_length=10, default='en')
    page_count = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)

    # ── Categorization ───────────────────────────────────────────
    categories = models.ManyToManyField(Category, related_name='books', blank=True)
    subjects = models.JSONField(default=list)  # Raw subjects from Open Library

    # ── Media ────────────────────────────────────────────────────
    cover_image = models.URLField(blank=True)   # Open Library cover URL
    cover_image_m = models.URLField(blank=True) # Medium size cover
    cover_image_s = models.URLField(blank=True) # Small size cover

    # ── Ratings & Popularity ─────────────────────────────────────
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    ratings_count = models.PositiveIntegerField(default=0)
    reviews_count = models.PositiveIntegerField(default=0)

    # ── Trending Metrics ─────────────────────────────────────────
    trending_score = models.FloatField(default=0)    # Computed weekly, drives trending page
    views_count = models.PositiveIntegerField(default=0)
    saves_count = models.PositiveIntegerField(default=0)  # Times added to shelves

    # ── Flags ────────────────────────────────────────────────────
    is_featured = models.BooleanField(default=False)  # Editor's pick / homepage spotlight
    is_verified = models.BooleanField(default=True)   # False = needs editorial review

    # ── Timestamps ───────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'books'
        ordering = ['-trending_score', '-created_at']
        indexes = [
            models.Index(fields=['trending_score']),
            models.Index(fields=['publish_year']),
            models.Index(fields=['language']),
            models.Index(fields=['average_rating']),
        ]

    def save(self, *args, **kwargs):
        # Auto-generate unique slug from title + author
        if not self.slug:
            author_part = self.authors[0] if self.authors else ''
            base_slug = slugify(f"{self.title} {author_part}")[:450]
            slug = base_slug
            n = 1
            while Book.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        authors_str = ', '.join(self.authors[:2]) if self.authors else 'Unknown'
        return f"{self.title} — {authors_str}"

    @property
    def authors_display(self):
        """Formatted author string for display."""
        if not self.authors:
            return 'Unknown Author'
        if len(self.authors) == 1:
            return self.authors[0]
        if len(self.authors) == 2:
            return ' & '.join(self.authors)
        return f"{self.authors[0]} and {len(self.authors) - 1} others"


# ─────────────────────────────────────────────
# REVIEW MODEL
# ─────────────────────────────────────────────

class Review(models.Model):
    """User reviews and ratings for books."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField(blank=True, max_length=2000)
    is_spoiler = models.BooleanField(default=False)

    # ── Engagement ───────────────────────────────────────────────
    helpful_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ['user', 'book']  # One review per user per book
        ordering = ['-helpful_count', '-created_at']

    def __str__(self):
        return f"{self.user.display_name} → {self.book.title} ({self.rating}★)"


class ReviewHelpful(models.Model):
    """Tracks which users found a review helpful (like Reddit upvotes)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')

    class Meta:
        db_table = 'review_helpful'
        unique_together = ['user', 'review']
