import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContainer } from '../components/common/Toast'
import type { Toast as ToastType } from '../types'

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void
  toasts: Array<ToastType & { id: string }>
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Array<ToastType & { id: string }>>([])

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string,
  ) => {
    const id = Date.now().toString()
    const toast: ToastType & { id: string } = {
      id,
      type,
      message,
      title,
      onClose: removeToast,
      autoClose: true,
    }
    setToasts((prev) => [...prev, toast])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
