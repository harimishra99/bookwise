/**
 * Shelf Detail Page
 * =================
 * Shows all books in a specific shelf.
 */

import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useShelfBooks, useShelves } from '@/hooks/useShelves'
import BookCard, { BookCardSkeleton } from '@/components/books/BookCard'

export default function ShelfDetailPage() {
  const { id } = useParams()
  const { data: shelves } = useShelves()
  const { data: shelfBooks, isLoading } = useShelfBooks(id)
  const shelf = shelves?.find(s => s.id === Number(id))

  return (
    <div className="shelf-detail-page">
      <div className="section-container">
        <div className="shelf-detail-header">
          <Link to="/shelves" className="back-link">
            <ArrowLeft size={18} /> All Shelves
          </Link>
          <h1>{shelf?.name || 'My Shelf'}</h1>
          <p>{shelf?.books_count || 0} books</p>
        </div>

        {isLoading ? (
          <div className="books-grid"><BookCardSkeleton count={8} /></div>
        ) : shelfBooks?.length === 0 || shelfBooks?.results?.length === 0 ? (
          <div className="empty-shelf">
            <BookOpen size={48} />
            <h3>This shelf is empty</h3>
            <p>Start adding books from the homepage or search page.</p>
            <Link to="/" className="btn-primary">Discover Books</Link>
          </div>
        ) : (
          <div className="books-grid">
            {(shelfBooks?.results || shelfBooks)?.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <BookCard book={item.book} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
