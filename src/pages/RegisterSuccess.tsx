import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export const RegisterSuccess = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-border p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-muted-foreground mb-6">
            Akun Anda telah terdaftar. Silakan login untuk melanjutkan.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}
