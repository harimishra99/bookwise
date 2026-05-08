/**
 * Book API Hooks (React Query)
 * ============================
 * Custom hooks for fetching book data with caching, loading states,
 * and automatic background refetching.
 *
 * Usage:
 *   const { data, isLoading } = useTrendingBooks()
 *   const { data } = useBook('the-alchemist-paulo-coelho')
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import useAuthStore from '@/stores/authStore'

// ── Query Keys (used for cache invalidation) ─────────────────────────────────
export const bookKeys = {
  all: ['books'],
  lists: () => [...bookKeys.all, 'list'],
  list: (filters) => [...bookKeys.lists(), filters],
  trending: () => [...bookKeys.all, 'trending'],
  featured: () => [...bookKeys.all, 'featured'],
  newReleases: () => [...bookKeys.all, 'new-releases'],
  detail: (slug) => [...bookKeys.all, 'detail', slug],
  reviews: (slug) => [...bookKeys.all, 'reviews', slug],
  category: (slug) => [...bookKeys.all, 'category', slug],
  categories: () => ['categories'],
  recommendations: () => ['recommendations'],
  similar: (slug) => ['similar', slug],
}


// ── Category Hooks ────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: bookKeys.categories(),
    queryFn: () => api.get('/books/categories/').then(r => r.data),
    staleTime: 1000 * 60 * 30, // Categories don't change often — 30min cache
  })
}

export function useFeaturedCategories() {
  return useQuery({
    queryKey: [...bookKeys.categories(), 'featured'],
    queryFn: () => api.get('/books/categories/featured/').then(r => r.data),
    staleTime: 1000 * 60 * 30,
  })
}


// ── Book List Hooks ───────────────────────────────────────────────────────────

export function useTrendingBooks() {
  return useQuery({
    queryKey: bookKeys.trending(),
    queryFn: () => api.get('/books/trending/').then(r => r.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useFeaturedBooks() {
  return useQuery({
    queryKey: bookKeys.featured(),
    queryFn: () => api.get('/books/featured/').then(r => r.data),
    staleTime: 1000 * 60 * 60,
  })
}

export function useNewReleases() {
  return useQuery({
    queryKey: bookKeys.newReleases(),
    queryFn: () => api.get('/books/new-releases/').then(r => r.data),
    staleTime: 1000 * 60 * 60,
  })
}

export function useBooksByCategory(slug) {
  return useQuery({
    queryKey: bookKeys.category(slug),
    queryFn: () => api.get(`/books/category/${slug}/`).then(r => r.data),
    enabled: !!slug,
    staleTime: 1000 * 60 * 15,
  })
}

/**
 * Infinite scroll hook for search results.
 * Automatically fetches next pages as user scrolls.
 */
export function useBookSearch(filters = {}) {
  return useInfiniteQuery({
    queryKey: bookKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ ...filters, page: pageParam })
      return api.get(`/books/?${params}`).then(r => r.data)
    },
    getNextPageParam: (lastPage) => {
      // DRF pagination: next contains the URL, we extract page number
      if (lastPage.next) {
        const url = new URL(lastPage.next)
        return url.searchParams.get('page')
      }
      return undefined
    },
    enabled: true,
    staleTime: 1000 * 60 * 5,
  })
}


// ── Book Detail Hooks ─────────────────────────────────────────────────────────

export function useBook(slug) {
  return useQuery({
    queryKey: bookKeys.detail(slug),
    queryFn: () => api.get(`/books/${slug}/`).then(r => r.data),
    enabled: !!slug,
    staleTime: 1000 * 60 * 15,
  })
}

export function useBookReviews(slug) {
  return useQuery({
    queryKey: bookKeys.reviews(slug),
    queryFn: () => api.get(`/books/${slug}/reviews/`).then(r => r.data),
    enabled: !!slug,
  })
}

export function useSubmitReview(slug) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewData) => api.post(`/books/${slug}/reviews/`, reviewData),
    onSuccess: () => {
      // Refresh reviews and book data after submission
      queryClient.invalidateQueries({ queryKey: bookKeys.reviews(slug) })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(slug) })
    },
  })
}


// ── Recommendation Hooks ──────────────────────────────────────────────────────

export function useRecommendations() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: bookKeys.recommendations(),
    queryFn: () => api.get('/recommendations/').then(r => r.data),
    staleTime: 1000 * 60 * 30,
    enabled: isAuthenticated, // ← only fetch if logged in
  })
}

export function useSimilarBooks(slug) {
  return useQuery({
    queryKey: bookKeys.similar(slug),
    queryFn: () => api.get(`/recommendations/similar/${slug}/`).then(r => r.data.books),
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
  })
}


// ── External Search (Open Library live) ──────────────────────────────────────

export function useExternalSearch(query) {
  return useQuery({
    queryKey: ['external-search', query],
    queryFn: () => api.get(`/books/search-external/?q=${encodeURIComponent(query)}`).then(r => r.data),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAIRecommendations() {
  return useMutation({
    mutationFn: (formData) => 
      api.post('/recommendations/ai/', formData).then(r => r.data),
  })
}
