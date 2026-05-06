"""Users App — Admin Configuration"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'reader_type', 'books_read_count', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'reader_type']
    search_fields = ['email', 'full_name']
    ordering = ['-date_joined']
    readonly_fields = ['date_joined', 'last_seen', 'books_read_count', 'reviews_count']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Profile', {'fields': ('full_name', 'avatar', 'bio', 'reader_type')}),
        ('Preferences', {'fields': ('preferred_genres', 'preferred_languages')}),
        ('Stats', {'fields': ('books_read_count', 'reviews_count', 'last_seen')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('date_joined',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
