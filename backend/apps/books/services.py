"""
Books App — Open Library Service
=================================
Handles all communication with the Open Library API.
Free, no API key required. Rate limit: be polite (1 req/sec).
Docs: https://openlibrary.org/developers/api
"""

import requests
from django.conf import settings


class OpenLibraryService:
    """Wrapper for the Open Library REST API."""

    BASE_URL = 'https://openlibrary.org'
    COVERS_URL = 'https://covers.openlibrary.org/b'

    def search_books(self, query: str, limit: int = 20, offset: int = 0) -> dict:
        """
        Search Open Library for books.
        Returns list of book data dicts formatted for our frontend.
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/search.json",
                params={
                    'q': query,
                    'limit': limit,
                    'offset': offset,
                    'fields': 'key,title,author_name,first_publish_year,cover_i,'
                              'publisher,subject,isbn,language,number_of_pages_median',
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            return {
                'total': data.get('numFound', 0),
                'books': [self._format_search_result(doc) for doc in data.get('docs', [])]
            }
        except requests.RequestException as e:
            return {'error': str(e), 'books': []}

    def get_book_by_olid(self, olid: str) -> dict:
        """
        Fetch full book details by Open Library Work ID (e.g., OL12345W).
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/works/{olid}.json",
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            return {}

    def get_trending_books(self, period: str = 'weekly', limit: int = 50) -> list:
        """
        Fetch trending books from Open Library's trending API.
        period: 'daily', 'weekly', 'monthly', 'yearly', 'forever'
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/trending/{period}.json",
                params={'limit': limit},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            return [self._format_search_result(doc) for doc in data.get('works', [])]
        except requests.RequestException:
            return []

    def get_cover_url(self, cover_id: int, size: str = 'M') -> str:
        """
        Get cover image URL from Open Library.
        size: 'S' (small), 'M' (medium), 'L' (large)
        """
        if not cover_id:
            return ''
        return f"{self.COVERS_URL}/id/{cover_id}-{size}.jpg"

    def _format_search_result(self, doc: dict) -> dict:
        """Transform Open Library API response to our standardized format."""
        cover_id = doc.get('cover_i')
        return {
            'open_library_id': doc.get('key', '').replace('/works/', ''),
            'title': doc.get('title', ''),
            'authors': doc.get('author_name', []),
            'publisher': doc.get('publisher', [''])[0] if doc.get('publisher') else '',
            'publish_year': doc.get('first_publish_year'),
            'language': (doc.get('language') or ['en'])[0],
            'page_count': doc.get('number_of_pages_median'),
            'subjects': (doc.get('subject') or [])[:10],  # Limit subjects list
            'isbn_13': (doc.get('isbn') or [''])[0],
            'cover_image': self.get_cover_url(cover_id, 'L'),
            'cover_image_m': self.get_cover_url(cover_id, 'M'),
            'cover_image_s': self.get_cover_url(cover_id, 'S'),
        }
