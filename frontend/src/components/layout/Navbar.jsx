/**
 * Navbar Component
 * ================
 * Top navigation bar with:
 *   - Logo + brand name
 *   - Search bar (desktop)
 *   - Category dropdown
 *   - Auth buttons / user menu
 *   - Mobile hamburger menu
 */

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, BookOpen, User, LogOut, Library, ChevronDown, Menu, X, Bell } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { useCategories } from '@/hooks/useBooks'
import clsx from 'clsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { data: categoriesRaw } = useCategories()
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : categoriesRaw?.results || []
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  // Split categories by type for organized dropdown
  const featuredCategories = categories?.filter(c => c.is_featured) || []
  const genreCategories = categories?.filter(c => c.category_type === 'genre') || []

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ── Logo ─────────────────────────────────────────── */}
        <Link to="/" className="navbar-logo">
          <BookOpen className="logo-icon" />
          <span className="logo-text">BookSuggestion</span>
        </Link>

        {/* ── Desktop Search ────────────────────────────────── */}
        <form onSubmit={handleSearch} className="navbar-search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, authors, genres..."
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        {/* ── Desktop Nav Links ─────────────────────────────── */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
            {isAuthenticated && (
          <Link to="/shelves" className="nav-link">My Shelves</Link>
      )}

          {/* Categories Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setIsCategoryMenuOpen(true)}
            onMouseLeave={() => setIsCategoryMenuOpen(false)}
          >
            <button className="nav-link dropdown-trigger">
              Browse <ChevronDown size={14} />
            </button>

            {isCategoryMenuOpen && (
              <div className="dropdown-menu categories-dropdown">
                <div className="dropdown-section">
                  <p className="dropdown-label">Featured</p>
                  {featuredCategories.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="dropdown-item"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="dropdown-section">
                  <p className="dropdown-label">All Genres</p>
                  {genreCategories.slice(0, 8).map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      className="dropdown-item"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/search?trending=true" className="nav-link">Trending</Link>
        </div>

        {/* ── Auth Buttons / User Menu ──────────────────────── */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="user-avatar-btn"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.display_name} className="user-avatar" />
                ) : (
                  <div className="user-avatar-fallback">
                    {user?.display_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="user-name">{user?.display_name}</span>
                <ChevronDown size={14} />
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-name">{user?.display_name}</p>
                    <p className="user-dropdown-email">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/shelves" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <Library size={16} /> My Shelves
                  </Link>
                  <div className="user-dropdown-divider" />
                  <button onClick={handleLogout} className="user-dropdown-item logout">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-ghost">Sign In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="mobile-search">
            <Search size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books..."
              className="mobile-search-input"
            />
          </form>
          <Link to="/" className="mobile-nav-link">Home</Link>
          <Link to="/search?trending=true" className="mobile-nav-link">🔥 Trending</Link>
          <p className="mobile-nav-section">Browse</p>
          {featuredCategories.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="mobile-nav-link">
              {cat.icon} {cat.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="btn-ghost full-width">Sign In</Link>
              <Link to="/register" className="btn-primary full-width">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
