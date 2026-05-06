/**
 * Profile Page
 * ============
 * User profile with stats, genre preferences, and settings.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, BookOpen, Star, Edit3, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '@/stores/authStore'
import { useCategories } from '@/hooks/useBooks'
import toast from 'react-hot-toast'

const READER_TYPES = [
  { value: 'new', label: '🌱 New Reader', desc: 'Just getting started' },
  { value: 'casual', label: '📖 Casual Reader', desc: 'Reading for enjoyment' },
  { value: 'avid', label: '📚 Avid Reader', desc: 'Reading regularly' },
  { value: 'enthusiast', label: '🎓 Book Enthusiast', desc: 'Reading is a lifestyle' },
]

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const { data: categories } = useCategories()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      reader_type: user?.reader_type || 'casual',
      preferred_genres: user?.preferred_genres || [],
    }
  })

  const selectedGenres = watch('preferred_genres') || []

  const toggleGenre = (slug) => {
    const current = selectedGenres
    const updated = current.includes(slug)
      ? current.filter(g => g !== slug)
      : [...current, slug]
    setValue('preferred_genres', updated)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await updateProfile(data)
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ── Profile Header ────────────────────────────────── */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.display_name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-fallback">
                {user?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-name-area">
            {!isEditing ? (
              <>
                <h1>{user?.display_name}</h1>
                <p className="profile-email">{user?.email}</p>
                {user?.bio && <p className="profile-bio">{user.bio}</p>}
                <span className="reader-type-badge">
                  {READER_TYPES.find(r => r.value === user?.reader_type)?.label || '📖 Reader'}
                </span>
              </>
            ) : null}
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-ghost edit-btn">
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="profile-stats">
          <div className="stat-card">
            <BookOpen size={24} />
            <strong>{user?.books_read_count || 0}</strong>
            <span>Books Read</span>
          </div>
          <div className="stat-card">
            <Star size={24} />
            <strong>{user?.reviews_count || 0}</strong>
            <span>Reviews</span>
          </div>
          <div className="stat-card">
            <User size={24} />
            <strong>{user?.preferred_genres?.length || 0}</strong>
            <span>Genres</span>
          </div>
        </div>

        {/* ── Edit Form ─────────────────────────────────────── */}
        {isEditing && (
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="profile-edit-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="field-group">
              <label>Full Name</label>
              <input type="text" className="form-input" {...register('full_name')} />
            </div>

            <div className="field-group">
              <label>Bio</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Tell other readers about yourself..."
                maxLength={500}
                {...register('bio')}
              />
            </div>

            <div className="field-group">
              <label>Reader Type</label>
              <div className="reader-type-options">
                {READER_TYPES.map(rt => (
                  <label
                    key={rt.value}
                    className={`reader-type-option ${watch('reader_type') === rt.value ? 'selected' : ''}`}
                  >
                    <input type="radio" value={rt.value} {...register('reader_type')} />
                    <span>{rt.label}</span>
                    <small>{rt.desc}</small>
                  </label>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>Favourite Genres <small>(used for recommendations)</small></label>
              <div className="genre-picker">
                {categories?.filter(c => c.category_type === 'genre').map(cat => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleGenre(cat.slug)}
                    className={`genre-chip ${selectedGenres.includes(cat.slug) ? 'selected' : ''}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-ghost">
                <X size={16} /> Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  )
}
