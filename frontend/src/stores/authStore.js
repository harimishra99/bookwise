import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login/', { email, password })
          const { access, refresh } = response.data

          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)

          const userResponse = await api.get('/users/me/')

          set({
            user: userResponse.data,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.non_field_errors?.[0]
            || error.response?.data?.detail
            || 'Login failed. Please try again.'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      register: async (email, password1, password2) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/registration/', {
            email, password1, password2
          })
          const { access, refresh } = response.data

          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)

          const userResponse = await api.get('/users/me/')

          set({
            user: userResponse.data,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error) {
          const errors = error.response?.data
          const message = errors?.email?.[0]
            || errors?.password1?.[0]
            || errors?.non_field_errors?.[0]
            || 'Registration failed.'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout/')
        } catch { }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
      },

      fetchMe: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        try {
          const response = await api.get('/users/me/')
          set({ user: response.data, isAuthenticated: true })
        } catch {
          // Don't clear auth on network error — only on 401
        }
      },

      setGoogleUser: (userData, access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        set({
          user: userData,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      updateProfile: async (data) => {
        const response = await api.patch('/users/me/', data)
        set({ user: response.data })
        return response.data
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bookwise-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore