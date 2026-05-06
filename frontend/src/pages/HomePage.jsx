/**
 * Home Page
 * =========
 * The main landing page with:
 *   - Hero section with search
 *   - Featured categories row
 *   - Trending books carousel
 *   - New releases section
 *   - Personalized recommendations (if logged in)
 *   - Editor's picks
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Sparkles, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  useTrendingBooks, useFeaturedBooks, useNewReleases,
  useFeaturedCategories, useRecommendations
} from '@/hooks/useBooks'
import BookCard, { BookCardSkeleton } from '@/components/books/BookCard'
import useAuthStore from '@/stores/authStore'

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, linkTo, linkText }) {
  const navigate = useNavigate()
  return (
    <div className="section-header">
      <div className="section-header-left">
        {Icon && <Icon size={22} className="section-icon" />}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {linkTo && (
        <button onClick={() => navigate(linkTo)} className="see-all-btn">
          {linkText || 'See all'} →
        </button>
      )}
    </div>
  )
}

// ── Category Pill ─────────────────────────────────────────────────────────────
function CategoryPill({ category }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/category/${category.slug}`)}
      className="category-pill"
      style={{ '--category-color': category.color }}
    >
      <span className="category-pill-icon">{category.icon}</span>
      <span>{category.name}</span>
    </button>
  )
}

// ── Books Row (horizontal scroll) ─────────────────────────────────────────────
function BooksRow({ books, isLoading }) {
  return (
    <div className="books-row">
      {isLoading ? (
        <BookCardSkeleton count={6} />
      ) : (
        books?.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <BookCard book={book} variant="row" />
          </motion.div>
        ))
      )}
    </div>
  )
}

// ── Books Grid ────────────────────────────────────────────────────────────────
function BooksGrid({ books, isLoading }) {
  return (
    <div className="books-grid">
      {isLoading ? (
        <BookCardSkeleton count={8} />
      ) : (
        books?.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <BookCard book={book} variant="grid" />
          </motion.div>
        ))
      )}
    </div>
  )
}


// ── Main Home Page Component ──────────────────────────────────────────────────
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const { data: featuredCategoriesRaw, isLoading: categoriesLoading } = useFeaturedCategories()
const { data: trendingBooksRaw, isLoading: trendingLoading } = useTrendingBooks()
const { data: featuredBooksRaw, isLoading: featuredLoading } = useFeaturedBooks()
const { data: newReleasesRaw, isLoading: newReleasesLoading } = useNewReleases()
const { data: recommendations, isLoading: recommendationsLoading } = useRecommendations()

// Handle both paginated {results:[]} and plain array responses
const featuredCategories = Array.isArray(featuredCategoriesRaw) ? featuredCategoriesRaw : featuredCategoriesRaw?.results || []
const trendingBooks = Array.isArray(trendingBooksRaw) ? trendingBooksRaw : trendingBooksRaw?.results || []
const featuredBooks = Array.isArray(featuredBooksRaw) ? featuredBooksRaw : featuredBooksRaw?.results || []
const newReleases = Array.isArray(newReleasesRaw) ? newReleasesRaw : newReleasesRaw?.results || []

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="home-page">

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-title">
              Find Your Next
              <span className="hero-title-highlight"> Favourite Book</span>
            </h1>
            <p className="hero-subtitle">
              Personalized recommendations, trending titles, and expert curation
              — all in one place.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            className="hero-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Search size={20} className="hero-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50,000+ books by title, author, or genre..."
              className="hero-search-input"
              autoFocus
            />
            <button type="submit" className="hero-search-btn">
              Search
            </button>
          </motion.form>

          <motion.div
            className="hero-suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span>Try:</span>
            {['Atomic Habits', 'Rich Dad Poor Dad', 'Harry Potter', 'Sapiens'].map(q => (
              <button
                key={q}
                onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
                className="suggestion-chip"
              >
                {q}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Hero decorative element */}
        <div className="hero-decoration" aria-hidden="true">
          <div className="hero-books-stack">
            {['📚', '📖', '📕', '📗', '📘'].map((emoji, i) => (
              <span key={i} style={{ '--delay': `${i * 0.1}s` }}>{emoji}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ────────────────────────────── */}
      <section className="home-section categories-section">
        <div className="section-container">
          <SectionHeader
            title="Browse by Category"
            subtitle="Find your next read by genre or mood"
          />
          <div className="categories-pills-row">
            {categoriesLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="category-pill skeleton shimmer" />
                ))
              : featuredCategories?.map(cat => (
                  <CategoryPill key={cat.slug} category={cat} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Personalized Recommendations (logged in users) ── */}
      {isAuthenticated && (
        <section className="home-section">
          <div className="section-container">
            <SectionHeader
              icon={Sparkles}
              title={`For You, ${user?.display_name?.split(' ')[0] || 'Reader'}`}
              subtitle={recommendations?.personalized
                ? 'Based on your reading preferences'
                : 'Trending books to get you started'}
              linkTo="/search"
              linkText="Explore more"
            />
            <BooksRow
              books={Array.isArray(recommendations?.books) ? recommendations.books.slice(0, 10) : []}
              isLoading={recommendationsLoading}
            />
          </div>
        </section>
      )}

      {/* ── Trending Books ─────────────────────────────────── */}
      <section className="home-section trending-section">
        <div className="section-container">
          <SectionHeader
            icon={TrendingUp}
            title="Trending This Week"
            subtitle="Books everyone is reading right now"
            linkTo="/search?trending=true"
            linkText="See all trending"
          />
          <BooksRow
            books={trendingBooks?.slice(0, 12)}
            isLoading={trendingLoading}
          />
        </div>
      </section>

      {/* ── Editor's Picks ─────────────────────────────────── */}
      <section className="home-section featured-section">
        <div className="section-container">
          <SectionHeader
            icon={BookOpen}
            title="Editor's Picks"
            subtitle="Hand-selected books you shouldn't miss"
            linkTo="/category/editors-picks"
          />
          <BooksGrid
            books={featuredBooks?.slice(0, 8)}
            isLoading={featuredLoading}
          />
        </div>
      </section>

      {/* ── New Releases ───────────────────────────────────── */}
      <section className="home-section">
        <div className="section-container">
          <SectionHeader
            title="New Releases"
            subtitle="Fresh off the press"
            linkTo="/search?ordering=-publish_year"
          />
          <BooksRow
            books={newReleases?.slice(0, 10)}
            isLoading={newReleasesLoading}
          />
        </div>
      </section>

      {/* ── CTA for non-logged in users ───────────────────── */}
      {!isAuthenticated && (
        <section className="home-cta">
          <div className="cta-content">
            <h2>Track your reading journey</h2>
            <p>Create shelves, write reviews, and get personalized recommendations.</p>
            <div className="cta-buttons">
              <a href="/register" className="btn-primary cta-btn">Start for Free</a>
              <a href="/login" className="btn-ghost cta-btn">Sign In</a>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
