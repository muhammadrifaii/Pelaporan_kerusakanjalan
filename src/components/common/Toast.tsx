import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  message: string
  title?: string
  onClose: (id: string) => void
  autoClose?: boolean
}

export const Toast = ({
  id,
  type,
  message,
  title,
  onClose,
  autoClose = true,
}: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const colors = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-danger/10 border-danger/20 text-danger',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-primary/10 border-primary/20 text-primary',
  }

  // Auto close after 4 seconds
  if (autoClose) {
    setTimeout(() => onClose(id), 4000)
  }

  return (
    <div
      className={`${colors[type]} border rounded-lg p-4 flex gap-3 items-start max-w-md shadow-lg animate-in slide-in-from-right`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export const ToastContainer = ({
  toasts,
  onClose,
}: {
  toasts: Array<ToastProps & { id: string }>
  onClose: (id: string) => void
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}
