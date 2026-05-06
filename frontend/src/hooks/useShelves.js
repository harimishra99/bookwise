/**
 * Shelves Hooks (React Query)
 * ===========================
 * Hooks for managing user reading shelves.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

export const shelfKeys = {
  all: ['shelves'],
  list: () => [...shelfKeys.all, 'list'],
  detail: (id) => [...shelfKeys.all, 'detail', id],
  books: (id) => [...shelfKeys.all, 'books', id],
}

export function useShelves() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: shelfKeys.list(),
    queryFn: () => api.get('/shelves/').then(r => r.data),
    enabled: isAuthenticated,
  })
}

export function useShelfBooks(shelfId) {
  return useQuery({
    queryKey: shelfKeys.books(shelfId),
    queryFn: () => api.get(`/shelves/${shelfId}/books/`).then(r => r.data),
    enabled: !!shelfId,
  })
}

export function useAddToShelf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shelfId, bookSlug, notes }) =>
      api.post(`/shelves/${shelfId}/books/${bookSlug}/`, { notes }),
    onSuccess: (_, { shelfId }) => {
      queryClient.invalidateQueries({ queryKey: shelfKeys.books(shelfId) })
      queryClient.invalidateQueries({ queryKey: shelfKeys.list() })
      toast.success('Added to shelf!')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add book'
      toast.error(message)
    },
  })
}

export function useRemoveFromShelf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shelfId, bookSlug }) =>
      api.delete(`/shelves/${shelfId}/books/${bookSlug}/`),
    onSuccess: (_, { shelfId }) => {
      queryClient.invalidateQueries({ queryKey: shelfKeys.books(shelfId) })
      queryClient.invalidateQueries({ queryKey: shelfKeys.list() })
      toast.success('Removed from shelf')
    },
  })
}

export function useCreateShelf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/shelves/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shelfKeys.list() })
      toast.success('Shelf created!')
    },
  })
}
