/**
 * Book Detail Page
 * ================
 * Full book page with:
 *   - Cover, metadata, description
 *   - Add to shelf button
 *   - Star rating and reviews
 *   - Similar books
 *   - Books by same author
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, BookOpen, Calendar, Globe, Hash, Bookmark, BookmarkCheck,
         ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBook, useBookReviews, useSubmitReview, useSimilarBooks } from '@/hooks/useBooks'
import { useShelves, useAddToShelf } from '@/hooks/useShelves'
import BookCard, { BookCardSkeleton } from '@/components/books/BookCard'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

// ── Star Rating Input ─────────────────────────────────────────────────────────
function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="star-rating-input">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`star-btn ${star <= (hovered || value) ? 'active' : ''}`}
        >
          ★
        </button>
      ))}
      <span className="rating-label">
        {value ? `${value} star${value > 1 ? 's' : ''}` : 'Select rating'}
      </span>
    </div>
  )
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const [showFull, setShowFull] = useState(false)
  const isLong = review.body?.length > 300

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {review.user.avatar ? (
            <img src={review.user.avatar} alt={review.user.display_name} className="reviewer-avatar" />
          ) : (
            <div className="reviewer-avatar-fallback">
              {review.user.display_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="reviewer-name">{review.user.display_name}</p>
            <p className="review-date">
              {new Date(review.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="review-stars">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </div>
      </div>

      {review.is_spoiler && (
        <div className="spoiler-warning">
          <AlertTriangle size={14} /> Contains spoilers
        </div>
      )}

      {review.title && <h4 className="review-title">{review.title}</h4>}

      <p className={`review-body ${!showFull && isLong ? 'truncated' : ''}`}>
        {review.body}
      </p>

      {isLong && (
        <button onClick={() => setShowFull(!showFull)} className="read-more-btn">
          {showFull ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
        </button>
      )}
    </div>
  )
}

// ── Write Review Form ─────────────────────────────────────────────────────────
function WriteReviewForm({ bookSlug, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const { mutate: submitReview, isPending } = useSubmitReview(bookSlug)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a star rating'); return }
    submitReview(
      { rating, title, body, is_spoiler: isSpoiler },
      {
        onSuccess: () => { toast.success('Review submitted!'); onSuccess?.() },
        onError: (err) => {
          const msg = err.response?.data?.non_field_errors?.[0] || 'Failed to submit review'
          toast.error(msg)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Write a Review</h3>
      <StarRatingInput value={rating} onChange={setRating} />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="form-input"
        maxLength={200}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts about this book..."
        className="form-input review-textarea"
        rows={4}
        maxLength={2000}
      />
      <label className="spoiler-checkbox">
        <input
          type="checkbox"
          checked={isSpoiler}
          onChange={(e) => setIsSpoiler(e.target.checked)}
        />
        Contains spoilers
      </label>
      <button type="submit" className="btn-primary" disabled={isPending || !rating}>
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}

// ── Add to Shelf Dialog ───────────────────────────────────────────────────────
function AddToShelfDialog({ book, onClose }) {
  const { data: shelves } = useShelves()
  const { mutate: addToShelf } = useAddToShelf()

  const handleAdd = (shelfId) => {
    addToShelf({ shelfId, bookSlug: book.slug })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3>Add to Shelf</h3>
        <div className="shelf-options">
          {(Array.isArray(shelves) ? shelves : shelves?.results || []).map(shelf => (
            <button key={shelf.id} onClick={() => handleAdd(shelf.id)} className="shelf-option-btn">
              <BookOpen size={16} />
              {shelf.name}
              <span className="shelf-count">{shelf.books_count} books</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="btn-ghost modal-close">Cancel</button>
      </motion.div>
    </div>
  )
}

// ── Main Book Detail Component ────────────────────────────────────────────────
export default function BookDetailPage() {
  const { slug } = useParams()
  const { isAuthenticated } = useAuthStore()
  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  const { data: book, isLoading, error } = useBook(slug)
  const { data: reviews, isLoading: reviewsLoading } = useBookReviews(slug)
  const { data: similarBooks } = useSimilarBooks(slug)

  if (isLoading) return <BookDetailSkeleton />
  if (error || !book) return (
    <div className="error-page">
      <h2>Book not found</h2>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )

  const descTooLong = book.description?.length > 500
  const displayDesc = descExpanded || !descTooLong
    ? book.description
    : book.description?.slice(0, 500) + '...'

  return (
    <div className="book-detail-page">
      {/* ── Book Hero ────────────────────────────────────────── */}
      <section className="book-hero">
        <div className="book-hero-container">
          {/* Cover */}
          <motion.div
            className="book-cover-large-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={`Cover of ${book.title}`}
                className="book-cover-large"
              />
            ) : (
              <div className="book-cover-large book-cover-large--placeholder">
                <BookOpen size={48} />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className="book-hero-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="book-title-large">{book.title}</h1>
            {book.subtitle && <p className="book-subtitle">{book.subtitle}</p>}
            <p className="book-authors-large">by {book.authors_display}</p>

            {/* Rating summary */}
            {book.ratings_count > 0 && (
              <div className="rating-summary">
                <div className="rating-stars-large">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={s <= Math.round(book.average_rating) ? 'star-filled' : 'star-empty'}>★</span>
                  ))}
                </div>
                <span className="rating-number">{Number(book.average_rating).toFixed(1)}</span>
                <span className="rating-total">({book.ratings_count.toLocaleString()} ratings)</span>
              </div>
            )}

            {/* Metadata chips */}
            <div className="book-meta-chips">
              {book.publish_year && (
                <span className="meta-chip"><Calendar size={13} />{book.publish_year}</span>
              )}
              {book.language && (
                <span className="meta-chip"><Globe size={13} />{book.language.toUpperCase()}</span>
              )}
              {book.page_count && (
                <span className="meta-chip"><Hash size={13} />{book.page_count} pages</span>
              )}
            </div>

            {/* Categories */}
            <div className="book-categories">
              {book.categories?.map(cat => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} className="category-badge">
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="book-actions">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsShelfDialogOpen(true)}
                  className="btn-primary btn-add-shelf"
                >
                  <Bookmark size={18} /> Add to Shelf
                </button>
              ) : (
                <Link to="/login" className="btn-primary btn-add-shelf">
                  <Bookmark size={18} /> Sign in to Save
                </Link>
              )}

              {book.open_library_id && (
                <a
                  href={`https://openlibrary.org/works/${book.open_library_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <ExternalLink size={16} /> Open Library
                </a>
              )}
            </div>

            {/* Publisher info */}
            {book.publisher && (
              <p className="publisher-info">Published by <strong>{book.publisher}</strong></p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="book-detail-body">
        {/* ── Description ─────────────────────────────────────── */}
        {book.description && (
          <section className="book-section">
            <h2>About this Book</h2>
            <p className="book-description">{displayDesc}</p>
            {descTooLong && (
              <button onClick={() => setDescExpanded(!descExpanded)} className="read-more-btn">
                {descExpanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
              </button>
            )}
          </section>
        )}

        {/* ── Reviews ─────────────────────────────────────────── */}
        <section className="book-section reviews-section">
          <div className="reviews-header">
            <h2>Reader Reviews <span>({book.reviews_count || 0})</span></h2>
            {isAuthenticated && !showWriteReview && (
              <button onClick={() => setShowWriteReview(true)} className="btn-primary">
                Write a Review
              </button>
            )}
          </div>

          {showWriteReview && (
            <WriteReviewForm
              bookSlug={slug}
              onSuccess={() => setShowWriteReview(false)}
            />
          )}

          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : reviews?.results?.length === 0 || reviews?.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this book!</p>
              {!isAuthenticated && (
                <Link to="/login" className="btn-ghost">Sign in to review</Link>
              )}
            </div>
          ) : (
            <div className="reviews-list">
              {(reviews?.results || reviews)?.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>

        {/* ── Similar Books ─────────────────────────────────── */}
        {similarBooks?.length > 0 && (
          <section className="book-section">
            <h2>Similar Books You Might Like</h2>
            <div className="similar-books-row">
              {similarBooks.map(book => (
                <BookCard key={book.id} book={book} variant="row" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Add to Shelf Dialog */}
      {isShelfDialogOpen && (
        <AddToShelfDialog book={book} onClose={() => setIsShelfDialogOpen(false)} />
      )}
    </div>
  )
}

function BookDetailSkeleton() {
  return (
    <div className="book-detail-page">
      <div className="book-hero">
        <div className="book-hero-container">
          <div className="book-cover-large-wrapper skeleton shimmer" style={{ height: 320, width: 210 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="shimmer" style={{ height: 36, width: '70%', borderRadius: 8 }} />
            <div className="shimmer" style={{ height: 20, width: '40%', borderRadius: 8 }} />
            <div className="shimmer" style={{ height: 20, width: '30%', borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
