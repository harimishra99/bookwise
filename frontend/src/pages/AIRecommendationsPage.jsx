import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, ArrowRight, ArrowLeft, Loader } from 'lucide-react'
import { useAIRecommendations } from '@/hooks/useBooks'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const QUESTIONS = [
  {
    id: 'genres',
    question: 'What genres do you love?',
    subtitle: 'Pick all that apply',
    type: 'multi',
    options: ['Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Sci-Fi', 
              'Romance', 'Thriller', 'Biography', 'Self-Help', 'History',
              'Horror', 'Adventure', 'Philosophy', 'Poetry']
  },
  {
    id: 'mood',
    question: "What's your current reading mood?",
    subtitle: 'Pick one that fits best',
    type: 'single',
    options: ['Inspire me', 'Make me think deeply', 'Entertain me', 
              'Teach me something new', 'Help me relax', 
              'Challenge my worldview', 'Make me emotional']
  },
  {
    id: 'favorite_books',
    question: 'Name a book you absolutely loved',
    subtitle: 'This helps us understand your taste',
    type: 'text',
    placeholder: 'e.g. Atomic Habits, Harry Potter, Sapiens...'
  },
  {
    id: 'favorite_authors',
    question: 'Any favorite authors?',
    subtitle: 'Optional — skip if unsure',
    type: 'text',
    placeholder: 'e.g. Yuval Noah Harari, J.K. Rowling...'
  },
  {
    id: 'reading_goal',
    question: "What's your reading goal?",
    subtitle: 'Pick one',
    type: 'single',
    options: ['Personal growth', 'Pure entertainment', 'Learn a new skill',
              'Understand the world better', 'Escape reality', 
              'Academic/professional development']
  },
  {
    id: 'book_length',
    question: 'How long a book do you prefer?',
    subtitle: 'Pick one',
    type: 'single',
    options: ['Short (under 200 pages)', 'Medium (200-400 pages)', 
              'Long (400+ pages)', "Doesn't matter"]
  },
  {
    id: 'avoid',
    question: 'Anything you want to avoid?',
    subtitle: 'Optional — skip if none',
    type: 'text',
    placeholder: 'e.g. violence, romance, politics...'
  },
]

export default function AIRecommendationsPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const { mutate: getRecommendations, data, isPending } = useAIRecommendations()

  const currentQ = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1

  const handleSingle = (option) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }))
  }

  const handleMulti = (option) => {
    setAnswers(prev => {
      const current = prev[currentQ.id] || []
      return {
        ...prev,
        [currentQ.id]: current.includes(option)
          ? current.filter(o => o !== option)
          : [...current, option]
      }
    })
  }

  const handleText = (value) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  const handleNext = () => {
    if (isLast) {
      getRecommendations(
        { ...answers, genres: (answers.genres || []).join(', ') },
        {
          onSuccess: () => setShowResults(true),
          onError: () => toast.error('Something went wrong. Try again.')
        }
      )
    } else {
      setStep(s => s + 1)
    }
  }

  const canProceed = () => {
    if (currentQ.type === 'text') return true // text is optional
    if (currentQ.type === 'multi') return (answers[currentQ.id] || []).length > 0
    return !!answers[currentQ.id]
  }

  if (showResults && data?.recommendations) {
    return (
      <div className="ai-results-page">
        <div className="ai-results-header">
          <Sparkles size={32} className="ai-sparkle-icon" />
          <h1>Your Personalized Picks</h1>
          <p>Curated just for you by BookWise AI</p>
        </div>
        <div className="ai-results-grid">
          {data.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              className="ai-result-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="ai-result-number">{i + 1}</div>
              {rec.db_book?.cover_image && (
                <img src={rec.db_book.cover_image} alt={rec.title} className="ai-result-cover" />
              )}
              <div className="ai-result-info">
                <h3>{rec.title}</h3>
                <p className="ai-result-author">by {rec.author}</p>
                <p className="ai-result-reason">✨ {rec.reason}</p>
                {rec.db_book?.slug && (
                  <Link to={`/books/${rec.db_book.slug}`} className="ai-result-link">
                    View Book →
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={() => { setStep(0); setAnswers({}); setShowResults(false) }}
          className="btn-primary ai-retry-btn"
        >
          Try Again with Different Preferences
        </button>
      </div>
    )
  }

  return (
    <div className="ai-quiz-page">
      <div className="ai-quiz-container">
        {/* Header */}
        <div className="ai-quiz-header">
          <Sparkles size={24} />
          <span>AI Book Finder</span>
        </div>

        {/* Progress bar */}
        <div className="ai-progress-bar">
          <div
            className="ai-progress-fill"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="ai-progress-text">{step + 1} of {QUESTIONS.length}</p>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="ai-question-block"
          >
            <h2 className="ai-question">{currentQ.question}</h2>
            <p className="ai-subtitle">{currentQ.subtitle}</p>

            {/* Multi select */}
            {currentQ.type === 'multi' && (
              <div className="ai-options-grid">
                {currentQ.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleMulti(opt)}
                    className={`ai-option ${(answers[currentQ.id] || []).includes(opt) ? 'selected' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Single select */}
            {currentQ.type === 'single' && (
              <div className="ai-options-list">
                {currentQ.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleSingle(opt)}
                    className={`ai-option-row ${answers[currentQ.id] === opt ? 'selected' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Text input */}
            {currentQ.type === 'text' && (
              <input
                type="text"
                placeholder={currentQ.placeholder}
                value={answers[currentQ.id] || ''}
                onChange={e => handleText(e.target.value)}
                className="ai-text-input"
                autoFocus
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="ai-nav-buttons">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost ai-back-btn">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed() || isPending}
            className="btn-primary ai-next-btn"
          >
            {isPending ? (
              <><Loader size={16} className="spinning" /> Finding your books...</>
            ) : isLast ? (
              <><Sparkles size={16} /> Get My Recommendations</>
            ) : (
              <>Next <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}