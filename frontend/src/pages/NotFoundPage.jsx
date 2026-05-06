import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <BookOpen size={64} />
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )
}
