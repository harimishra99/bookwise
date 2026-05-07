"""
Users App — Signals
===================
Automatically creates default shelves for every new user
regardless of how they signed up (Google, email, etc.)
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def create_default_shelves(sender, instance, created, **kwargs):
    """
    Fires every time a User is saved.
    If the user is newly created, create 3 default shelves.
    """
    if not created:
        return  # Only run for new users

    from apps.shelves.models import Shelf

    default_shelves = [
        {'name': 'Want to Read', 'slug': 'want-to-read'},
        {'name': 'Currently Reading', 'slug': 'reading'},
        {'name': 'Read', 'slug': 'read'},
    ]

    for shelf_data in default_shelves:
        Shelf.objects.get_or_create(
            user=instance,
            slug=shelf_data['slug'],
            defaults={
                'name': shelf_data['name'],
                'is_default': True,
                'is_public': True,
            }
        )