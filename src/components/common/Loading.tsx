import { Box } from 'lucide-react'

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
      />
    </div>
  )
}

export const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Memuat...</p>
      </div>
    </div>
  )
}

export const EmptyState = ({
  title = 'Tidak ada data',
  description = 'Data yang Anda cari tidak ditemukan',
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Box className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm text-center mb-6 max-w-sm">
        {description}
      </p>
      {action}
    </div>
  )
}

export const ErrorState = ({
  title = 'Terjadi Kesalahan',
  description = 'Terjadi kesalahan saat memproses permintaan Anda',
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
        <div className="text-3xl">⚠️</div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm text-center mb-6 max-w-sm">
        {description}
      </p>
      {action}
    </div>
  )
}

export const SkeletonLoader = ({
  count = 3,
  variant = 'list',
}: {
  count?: number
  variant?: 'list' | 'card' | 'table'
}) => {
  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-muted rounded-lg p-6 space-y-3">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
            <div className="h-4 bg-muted-foreground/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
            <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
            <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-muted rounded-lg animate-pulse"
        />
      ))}
    </div>
  )
}
