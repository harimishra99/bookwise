import { Link } from 'react-router-dom'
import { BookOpen, Linkedin, Instagram, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <BookOpen size={24} />
          <span>BookWise</span>
          <p>Discover your next great read.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Discover</h4>
            <Link to="/search?trending=true">Trending</Link>
            <Link to="/category/new-reader">New Readers</Link>
            <Link to="/category/fiction">Fiction</Link>
            <Link to="/category/finance">Finance</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Get Started</Link>
            <Link to="/shelves">My Shelves</Link>
            <Link to="/profile">Profile</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BookWise. Made with ❤️ for book lovers by Hari Shankar Mishra.</p>
        <div className="footer-social">
          <a href="https://www.linkedin.com/in/harishankarmishra9/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
          <a href="https://www.instagram.com/hari.mishra_/" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
          <a href="https://github.com/harimishra99/bookwise" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><Github size={18} /></a>
        </div>
      </div>
    </footer>
  )
}
