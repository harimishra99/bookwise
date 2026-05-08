import os
import json
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.books.models import Book

client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

SYSTEM_PROMPT = """You are BookWise AI, an expert book recommendation assistant.
Based on the user's reading preferences, recommend exactly 6 books.

You MUST respond with ONLY a valid JSON array, no other text:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "reason": "One sentence why this matches their taste"
  }
]"""

class AIRecommendationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        
        # Build prompt from user answers
        prompt = f"""Give me 6 book recommendations based on these preferences:
- Favorite genres: {data.get('genres', 'not specified')}
- Favorite books they've read: {data.get('favorite_books', 'not specified')}
- Favorite authors: {data.get('favorite_authors', 'not specified')}
- Current mood/vibe: {data.get('mood', 'not specified')}
- Reading goal: {data.get('reading_goal', 'not specified')}
- Preferred book length: {data.get('book_length', 'not specified')}
- Topics to avoid: {data.get('avoid', 'none')}

Respond with ONLY the JSON array."""

        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                model="llama3-8b-8192",
                temperature=0.7,
                max_tokens=1000,
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            # Clean response if needed
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
            
            recommendations = json.loads(response_text)
            
            # Try to match with books in our DB
            enriched = []
            for rec in recommendations:
                book_match = Book.objects.filter(
                    title__icontains=rec['title'].split(':')[0][:30]
                ).first()
                
                enriched.append({
                    'title': rec['title'],
                    'author': rec['author'],
                    'reason': rec['reason'],
                    'db_book': {
                        'slug': book_match.slug,
                        'cover_image': book_match.cover_image.url if book_match and book_match.cover_image else None,
                        'rating': str(book_match.rating) if book_match else None,
                    } if book_match else None
                })
            
            return Response({'recommendations': enriched, 'success': True})
        
        except json.JSONDecodeError:
            return Response({'error': 'AI response parsing failed', 'success': False}, status=500)
        except Exception as e:
            return Response({'error': str(e), 'success': False}, status=500)