import { useNavigate } from 'react-router-dom'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-8">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}
