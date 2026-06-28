import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground mb-6">
          Anda tidak memiliki akses ke halaman ini. Hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
