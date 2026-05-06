// ── MobileBottomNav.jsx ──────────────────────────────────────────────────────
// Shows at bottom of screen on mobile — like a native app
import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Library, User, TrendingUp } from 'lucide-react'
import useAuthStore from '@/stores/authStore'

export function MobileBottomNav() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuthStore()

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/search?trending=true', icon: TrendingUp, label: 'Trending' },
    ...(isAuthenticated
      ? [
          { to: '/shelves', icon: Library, label: 'Shelf' },
          { to: '/profile', icon: User, label: 'Profile' },
        ]
      : [{ to: '/login', icon: User, label: 'Sign In' }]
    ),
  ]

  return (
    <nav className="mobile-bottom-nav">
      {links.map(({ to, icon: Icon, label }) => (
        <Link key={to} to={to} className={`mobile-bottom-link ${pathname === to ? 'active' : ''}`}>
          <Icon size={22} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default MobileBottomNav
