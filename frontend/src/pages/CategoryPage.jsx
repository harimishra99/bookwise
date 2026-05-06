/**
 * Category Page
 * =============
 * Shows all books in a category with sorting.
 */

import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBooksByCategory, useCategories } from '@/hooks/useBooks'
import BookCard, { BookCardSkeleton } from '@/components/books/BookCard'

export default function CategoryPage() {
  const { slug } = useParams()
  const { data: books, isLoading } = useBooksByCategory(slug)
  const { data: categories } = useCategories()
  const category = categories?.find(c => c.slug === slug)

  return (
    <div className="category-page">
      {/* Category Hero */}
      <div
        className="category-hero"
        style={{ '--category-color': category?.color || '#6366f1' }}
      >
        <div className="category-hero-content">
          <span className="category-hero-icon">{category?.icon || '📚'}</span>
          <h1>{category?.name || slug}</h1>
          {category?.description && <p>{category.description}</p>}
          {category?.book_count > 0 && (
            <span className="category-book-count">{category.book_count} books</span>
          )}
        </div>
      </div>

      <div className="section-container">
        {isLoading ? (
          <div className="books-grid"><BookCardSkeleton count={12} /></div>
        ) : books?.results?.length === 0 || books?.length === 0 ? (
          <div className="no-results">
            <p>No books found in this category yet.</p>
          </div>
        ) : (
          <div className="books-grid">
            {(books?.results || books)?.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
