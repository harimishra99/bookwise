"""Books App — Admin Configuration"""
from django.contrib import admin
from .models import Book, Category, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'is_featured', 'book_count', 'sort_order']
    list_editable = ['is_featured', 'sort_order']
    list_filter = ['category_type', 'is_featured']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'authors_display', 'publisher', 'publish_year',
                    'average_rating', 'trending_score', 'is_featured', 'is_verified']
    list_editable = ['is_featured', 'is_verified']
    list_filter = ['is_featured', 'is_verified', 'language']
    search_fields = ['title', 'authors', 'publisher', 'isbn_13']
    filter_horizontal = ['categories']
    readonly_fields = ['slug', 'average_rating', 'ratings_count', 'reviews_count',
                       'trending_score', 'views_count', 'saves_count', 'created_at', 'updated_at']
    ordering = ['-trending_score']

    fieldsets = (
        ('Book Info', {'fields': ('title', 'subtitle', 'slug', 'authors', 'publisher', 'publish_date', 'publish_year')}),
        ('Content', {'fields': ('description', 'subjects', 'language', 'page_count')}),
        ('Covers', {'fields': ('cover_image', 'cover_image_m', 'cover_image_s')}),
        ('Categories', {'fields': ('categories',)}),
        ('External IDs', {'fields': ('open_library_id', 'isbn_10', 'isbn_13', 'google_books_id')}),
        ('Stats', {'fields': ('average_rating', 'ratings_count', 'reviews_count', 'trending_score', 'views_count', 'saves_count')}),
        ('Flags', {'fields': ('is_featured', 'is_verified')}),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['book', 'user', 'rating', 'helpful_count', 'created_at']
    list_filter = ['rating']
    search_fields = ['book__title', 'user__email', 'body']
    readonly_fields = ['helpful_count', 'created_at', 'updated_at']
