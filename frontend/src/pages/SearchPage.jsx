/**
 * Search Page
 * ===========
 * Full-featured search with:
 *   - Query from URL params (shareable URLs)
 *   - Filter sidebar (genre, year, rating, language)
 *   - Infinite scroll pagination
 *   - Sort options
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useBookSearch, useCategories } from '@/hooks/useBooks'
import BookCard, { BookCardSkeleton } from '@/components/books/BookCard'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
]

const SORT_OPTIONS = [
  { value: '-trending_score', label: 'Most Popular' },
  { value: '-average_rating', label: 'Highest Rated' },
  { value: '-publish_year', label: 'Newest First' },
  { value: 'publish_year', label: 'Oldest First' },
  { value: 'title', label: 'A → Z' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Sync all filter state with URL params for shareable links
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const language = searchParams.get('language') || ''
  const yearFrom = searchParams.get('year_from') || ''
  const yearTo = searchParams.get('year_to') || ''
  const minRating = searchParams.get('min_rating') || ''
  const ordering = searchParams.get('ordering') || '-trending_score'

  const { data: categories } = useCategories()

  // Build filter object for the API query
  const filters = {
    ...(query && { search: query }),
    ...(category && { category }),
    ...(language && { language }),
    ...(yearFrom && { year_from: yearFrom }),
    ...(yearTo && { year_to: yearTo }),
    ...(minRating && { min_rating: minRating }),
    ordering,
  }

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookSearch(filters)

  const allBooks = data?.pages?.flatMap(page => page.results || page) || []
  const totalCount = data?.pages?.[0]?.count

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.delete('page') // Reset to page 1 on filter change
    setSearchParams(newParams)
  }

  const clearAllFilters = () => {
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    setSearchParams(newParams)
  }

  const activeFilterCount = [category, language, yearFrom, yearTo, minRating]
    .filter(Boolean).length

  return (
    <div className="search-page">
      {/* ── Search Header ────────────────────────────────────── */}
      <div className="search-header">
        <div className="search-bar-wrapper">
          <Search size={20} className="search-bar-icon" />
          <input
            type="text"
            defaultValue={query}
            placeholder="Search books, authors, publishers..."
            className="search-bar-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilter('q', e.target.value)
            }}
            onChange={(e) => {
              // Debounced search
              clearTimeout(window._searchTimer)
              window._searchTimer = setTimeout(() => {
                updateFilter('q', e.target.value)
              }, 400)
            }}
          />
          {query && (
            <button onClick={() => updateFilter('q', '')} className="clear-search">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort + Filter controls */}
        <div className="search-controls">
          <select
            value={ordering}
            onChange={(e) => updateFilter('ordering', e.target.value)}
            className="sort-select"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`filter-toggle-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="search-layout">
        {/* ── Filter Sidebar ────────────────────────────────── */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.aside
              className="filter-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="filter-sidebar-header">
                <h3><Filter size={16} /> Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="clear-filters-btn">
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Genre / Category */}
              <div className="filter-group">
                <label className="filter-label">Genre</label>
                <select
                  value={category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Genres</option>
                  {categories?.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div className="filter-group">
                <label className="filter-label">Language</label>
                <select
                  value={language}
                  onChange={(e) => updateFilter('language', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any Language</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Publication Year */}
              <div className="filter-group">
                <label className="filter-label">Publication Year</label>
                <div className="year-range">
                  <input
                    type="number"
                    value={yearFrom}
                    onChange={(e) => updateFilter('year_from', e.target.value)}
                    placeholder="From"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="year-input"
                  />
                  <span>–</span>
                  <input
                    type="number"
                    value={yearTo}
                    onChange={(e) => updateFilter('year_to', e.target.value)}
                    placeholder="To"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="year-input"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="filter-group">
                <label className="filter-label">Minimum Rating</label>
                <div className="rating-filter">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => updateFilter('min_rating', minRating == rating ? '' : rating)}
                      className={`rating-filter-btn ${Number(minRating) === rating ? 'active' : ''}`}
                    >
                      {'★'.repeat(rating)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Results ───────────────────────────────────────── */}
        <div className="search-results">
          {/* Result count + active filters summary */}
          <div className="results-meta">
            {isLoading ? (
              <span className="results-count">Searching...</span>
            ) : (
              <span className="results-count">
                {totalCount != null ? `${totalCount.toLocaleString()} books found` : ''}
                {query && ` for "${query}"`}
              </span>
            )}

            {/* Active filter chips */}
            <div className="active-filters">
              {category && (
                <span className="filter-chip">
                  {categories?.find(c => c.slug === category)?.name || category}
                  <button onClick={() => updateFilter('category', '')}><X size={12} /></button>
                </span>
              )}
              {language && (
                <span className="filter-chip">
                  {LANGUAGES.find(l => l.code === language)?.label || language}
                  <button onClick={() => updateFilter('language', '')}><X size={12} /></button>
                </span>
              )}
              {minRating && (
                <span className="filter-chip">
                  {'★'.repeat(Number(minRating))}+ rating
                  <button onClick={() => updateFilter('min_rating', '')}><X size={12} /></button>
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="books-grid">
              <BookCardSkeleton count={12} />
            </div>
          ) : allBooks.length === 0 ? (
            <div className="no-results">
              <Search size={48} />
              <h3>No books found</h3>
              <p>Try different keywords or adjust your filters.</p>
              <button onClick={clearAllFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={allBooks.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="loading-more">
                  <div className="spinner" />
                  <span>Loading more books...</span>
                </div>
              }
              endMessage={
                <p className="end-message">You've seen all {allBooks.length} results!</p>
              }
            >
              <div className="books-grid">
                {allBooks.map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 12) * 0.03 }}
                  >
                    <BookCard book={book} />
                  </motion.div>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  )
}
