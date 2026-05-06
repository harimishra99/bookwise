import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import useAuthStore from '@/stores/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password1: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  password2: z.string(),
}).refine((data) => data.password1 === data.password2, {
  message: "Passwords don't match",
  path: ['password2'],
})

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    const result = await registerUser(data.email, data.password1, data.password2)
    if (result.success) {
      toast.success('Account created! Welcome to BookWise 🎉')
      navigate('/')
    } else {
      toast.error(result.error)
    }
  }

const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
  try {
    const result = await api.post('/auth/social/google/', {
      access_token: tokenResponse.access_token,
    })
    const { access, refresh, user } = result.data
    useAuthStore.getState().setGoogleUser(user, access, refresh)
    toast.success('Welcome!')
    navigate('/')
  } catch (err) {
    console.error(err)
    toast.error('Google login failed. Try again.')
  }
},
  onError: () => toast.error('Google login cancelled.'),
  flow: 'implicit',
})

  return (
    <motion.div
      className="auth-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="auth-form-header">
        <h1>Join BookWise</h1>
        <p>Create your free account and start discovering books</p>
      </div>

      <button onClick={() => googleLogin()} className="google-btn">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </button>

      <div className="auth-divider"><span>or sign up with email</span></div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-fields">
        <div className="field-group">
          <label htmlFor="full_name">Full Name</label>
          <div className="input-wrapper">
            <User size={16} className="input-icon" />
            <input
              id="full_name"
              type="text"
              placeholder="Your full name"
              className={`form-input ${errors.full_name ? 'input-error' : ''}`}
              {...register('full_name')}
            />
          </div>
          {errors.full_name && <p className="field-error">{errors.full_name.message}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail size={16} className="input-icon" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="password1">Password</label>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input
              id="password1"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`form-input ${errors.password1 ? 'input-error' : ''}`}
              {...register('password1')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="input-icon-right"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password1 && <p className="field-error">{errors.password1.message}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="password2">Confirm Password</label>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input
              id="password2"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              className={`form-input ${errors.password2 ? 'input-error' : ''}`}
              {...register('password2')}
            />
          </div>
          {errors.password2 && <p className="field-error">{errors.password2.message}</p>}
        </div>

        <p className="terms-note">
          By signing up you agree to our{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <button type="submit" className="btn-primary submit-btn" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </motion.div>
  )
}