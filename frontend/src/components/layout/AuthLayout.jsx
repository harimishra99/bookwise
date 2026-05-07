import { Outlet, Link, Navigate, useNavigate } from 'react-router-dom'
import { BookOpen, X } from 'lucide-react'
import useAuthStore from '@/stores/authStore'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="auth-layout">
      {/* Close button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          zIndex: 100,
        }}
      >
        <X size={28} />
      </button>

      <div className="auth-brand-panel">
        <Link to="/" className="auth-logo">
          <BookOpen size={32} />
          <span>BookSuggestion</span>
        </Link>
        <div className="auth-quote">
          <blockquote>"A reader lives a thousand lives before he dies."</blockquote>
          <cite>— George R.R. Martin</cite>
        </div>
        <div className="auth-stats">
          <div><strong>50K+</strong><span>Books</span></div>
          <div><strong>200+</strong><span>Genres</span></div>
          <div><strong>10K+</strong><span>Readers</span></div>
        </div>
      </div>
      <div className="auth-form-panel">
        <Outlet />
      </div>
    </div>
  )
}