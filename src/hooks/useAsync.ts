import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export const useAsync = <T,>(
  asyncFunction: () => Promise<{ data: T | null; error: Error | null }>,
  immediate = true,
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const execute = async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const { data, error } = await asyncFunction()
      if (error) throw error
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error })
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return { ...state, execute }
}

// Hook untuk redirect berdasarkan role
export const useRoleRedirect = () => {
  const { profile } = useAuth()

  const getRolePath = () => {
    switch (profile?.role) {
      case 'admin':
        return '/admin'
      case 'coordinator':
        return '/coordinator'
      case 'technician':
        return '/technician'
      default:
        return '/dashboard'
    }
  }

  return getRolePath()
}

// Hook untuk handle pagination
export const usePagination = (items: any[], pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = items.slice(startIndex, endIndex)

  return {
    currentPage,
    totalPages,
    currentItems,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}
