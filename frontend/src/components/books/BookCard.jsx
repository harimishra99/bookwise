/**
 * BookCard Component
 * ==================
 * Reusable card for displaying a book in grid/list views.
 * Shows cover, title, author, rating, and a save button.
 */

import { Link } from 'react-router-dom'
import { Star, Bookmark, BookmarkCheck } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

// Placeholder gradient when no cover image is available
const COVER_PLACEHOLDER_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

function getPlaceholderGradient(title) {
  // Deterministic gradient based on title so it's consistent
  const index = title.charCodeAt(0) % COVER_PLACEHOLDER_COLORS.length
  return COVER_PLACEHOLDER_COLORS[index]
}

export default function BookCard({ book, onSave, isSaved = false, variant = 'grid' }) {
  const [imgError, setImgError] = useState(false)
  const [localSaved, setLocalSaved] = useState(isSaved)

  const handleSave = (e) => {
    e.preventDefault() // Don't navigate to book page
    e.stopPropagation()
    setLocalSaved(!localSaved)
    onSave?.(book)
  }

  const coverSrc = imgError ? null : (book.cover_image_m || book.cover_image)

  return (
    <Link
      to={`/books/${book.slug}`}
      className={clsx('book-card', `book-card--${variant}`)}
    >
      {/* ── Cover Image ─────────────────────────────────────── */}
      <div className="book-cover-wrapper">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={`Cover of ${book.title}`}
            className="book-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="book-cover book-cover--placeholder"
            style={{ background: getPlaceholderGradient(book.title) }}
          >
            <span className="placeholder-title">{book.title.slice(0, 30)}</span>
          </div>
        )}

        {/* Save to shelf button */}
        <button
          onClick={handleSave}
          className={clsx('save-btn', localSaved && 'save-btn--saved')}
          aria-label={localSaved ? 'Remove from shelf' : 'Add to shelf'}
        >
          {localSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* ── Book Info ────────────────────────────────────────── */}
      <div className="book-info">
        <h3 className="book-title" title={book.title}>
          {book.title.length > 45 ? book.title.slice(0, 45) + '…' : book.title}
        </h3>
        <p className="book-author">
          {book.authors_display || book.authors?.join(', ') || 'Unknown Author'}
        </p>

        {/* Rating */}
        {book.average_rating > 0 && (
          <div className="book-rating">
            <Star size={13} className="star-icon" />
            <span>{Number(book.average_rating).toFixed(1)}</span>
            <span className="ratings-count">({book.ratings_count || 0})</span>
          </div>
        )}

        {/* Categories */}
        {book.categories?.length > 0 && (
          <div className="book-tags">
            {book.categories.slice(0, 2).map(cat => (
              <span key={cat.slug} className="book-tag">
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}


/**
 * BookCardSkeleton
 * ================
 * Loading placeholder shown while books are being fetched.
 */
export function BookCardSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="book-card skeleton">
          <div className="skeleton-cover shimmer" />
          <div className="skeleton-info">
            <div className="skeleton-line shimmer" style={{ width: '80%' }} />
            <div className="skeleton-line shimmer" style={{ width: '60%' }} />
            <div className="skeleton-line shimmer" style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </>
  )
}
