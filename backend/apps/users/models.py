"""
Users App — Models
==================
Custom User model extending AbstractBaseUser.
Uses email as the primary identifier (no username).
Stores user preferences for recommendations.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom manager for email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for BookWise.
    Email is the unique identifier — no username required.
    """

    # ── Core Fields ──────────────────────────────────────────────
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar = models.URLField(blank=True)  # Stores Google profile picture URL or uploaded URL

    # ── Reader Profile ───────────────────────────────────────────
    bio = models.TextField(blank=True, max_length=500)
    reader_type = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New Reader'),
            ('casual', 'Casual Reader'),
            ('avid', 'Avid Reader'),
            ('enthusiast', 'Book Enthusiast'),
        ],
        default='casual'
    )

    # ── Preferences (used by recommendation engine) ───────────────
    # Stored as comma-separated category slugs e.g. "fiction,self-help"
    preferred_genres = models.JSONField(default=list, blank=True)
    preferred_languages = models.JSONField(default=list, blank=True)

    # ── Auth Flags ───────────────────────────────────────────────
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_seen = models.DateTimeField(null=True, blank=True)

    # ── Social Auth ──────────────────────────────────────────────
    google_id = models.CharField(max_length=100, blank=True, unique=True, null=True)

    # ── Stats (denormalized for performance) ─────────────────────
    books_read_count = models.PositiveIntegerField(default=0)
    reviews_count = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    @property
    def display_name(self):
        """Return full name or email prefix."""
        return self.full_name or self.email.split('@')[0]
