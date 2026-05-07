import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Library, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useShelves, useCreateShelf } from '@/hooks/useShelves'
import toast from 'react-hot-toast'

export default function MyShelvesPage() {
  const { data: shelvesRaw, isLoading } = useShelves()
  const { mutate: createShelf, isPending } = useCreateShelf()
  const [isCreating, setIsCreating] = useState(false)
  const [newShelfName, setNewShelfName] = useState('')

  // Normalize to array
  const shelves = Array.isArray(shelvesRaw)
    ? shelvesRaw
    : shelvesRaw?.results || []

  const handleCreateShelf = (e) => {
    e.preventDefault()
    if (!newShelfName.trim()) return
    createShelf(
      { name: newShelfName.trim() },
      {
        onSuccess: () => {
          setNewShelfName('')
          setIsCreating(false)
        },
      }
    )
  }

  return (
    <div className="shelves-page">
      <div className="section-container">
        <div className="shelves-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Library size={28} /> My Bookshelves
            </h1>
            <p style={{ color: '#94a3b8', marginTop: '4px' }}>
              Organise your reading journey
            </p>
          </div>
          <button onClick={() => setIsCreating(!isCreating)} className="btn-primary">
            <Plus size={16} /> New Shelf
          </button>
        </div>

        {isCreating && (
          <motion.form
            onSubmit={handleCreateShelf}
            className="new-shelf-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="text"
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              placeholder="Shelf name (e.g. Summer Reads 2025)"
              className="form-input"
              autoFocus
              maxLength={100}
              style={{ padding: '10px 12px' }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending || !newShelfName.trim()}
            >
              {isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
          </motion.form>
        )}

        {isLoading ? (
          <div className="shelves-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="shelf-card skeleton shimmer"
                style={{ height: '180px' }} />
            ))}
          </div>
        ) : shelves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <h3>No shelves yet</h3>
            <p>Create your first shelf to start organising your books.</p>
          </div>
        ) : (
          <div className="shelves-grid">
            {shelves.map((shelf, i) => (
              <motion.div
                key={shelf.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/shelves/${shelf.id}`} className="shelf-card">
                  <div className="shelf-covers-preview">
                    {shelf.recent_books?.length > 0 ? (
                      shelf.recent_books.map((b, idx) => (
                        <img
                          key={idx}
                          src={b.cover}
                          alt={b.title}
                          className="shelf-cover-thumb"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ))
                    ) : (
                      <div className="shelf-empty-placeholder">
                        <BookOpen size={32} />
                      </div>
                    )}
                  </div>
                  <div className="shelf-card-info">
                    <h3>{shelf.name}</h3>
                    <p>{shelf.books_count || 0} book{shelf.books_count !== 1 ? 's' : ''}</p>
                    {shelf.description && (
                      <p className="shelf-desc">{shelf.description}</p>
                    )}
                  </div>
                  {shelf.is_default && (
                    <span className="default-badge">Default</span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}