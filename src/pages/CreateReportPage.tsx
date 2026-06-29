import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Upload, X, Loader2, Image as ImageIcon, LocateFixed } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase, isSimulator } from '../lib/supabase'
import { simulator } from '../lib/supabase-simulator'
import type { DamageCategory, SeverityLevel } from '../types'
import { ReportMap } from '../components/map/ReportMap'

const PEKANBARU_DISTRICTS = [
  'Bina Widya', 'Tuah Madani', 'Bukit Raya', 'Marpoyan Damai',
  'Tenayan Raya', 'Senapelan', 'Payung Sekaki', 'Rumbai'
]

const ALL_CATEGORIES = [
  'Jalan Berlubang', 'Jalan Retak', 'Jalan Ambles', 'Aspal Rusak',
  'Drainase Rusak', 'Genangan', 'Marka Jalan Rusak', 'Jembatan Rusak', 'Lainnya'
]

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_PHOTOS = 5

export const CreateReportPage = () => {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
    district: '',
    street_name: '',
  })
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | undefined>(undefined)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []
    const validPreviews: string[] = []

    if (photos.length + files.length > MAX_PHOTOS) {
      showToast('error', `Maksimal ${MAX_PHOTOS} foto`, 'Terlalu Banyak')
      return
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast('error', 'Format harus JPG, JPEG, PNG, atau WEBP', 'Format Tidak Didukung')
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast('error', `${file.name} melebihi 5MB`, 'File Terlalu Besar')
        continue
      }
      validFiles.push(file)
      validPreviews.push(URL.createObjectURL(file))
    }

    setPhotos((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...validPreviews])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCoordsChange = useCallback((coords: [number, number], streetName: string, _districtName: string) => {
    setSelectedCoords(coords)
    setLatitude(coords[0])
    setLongitude(coords[1])
    if (streetName) {
      setFormData((prev) => {
        if (prev.street_name) return prev
        return { ...prev, street_name: streetName }
      })
    }
    if (_districtName) {
      setFormData((prev) => {
        if (prev.district) return prev
        return { ...prev, district: _districtName }
      })
    }
  }, [])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Geolokasi tidak didukung browser Anda', 'Tidak Didukung')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLatitude(lat)
        setLongitude(lng)
        setSelectedCoords([lat, lng])
        showToast('success', 'Lokasi berhasil didapatkan', 'Lokasi Ditemukan')
      },
      () => {
        showToast('error', 'Gagal mendapatkan lokasi. Periksa izin lokasi.', 'Gagal')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (!photos.length) return []
    if (!supabase || !profile) return []

    const urls: string[] = []
    let hasError = false

    for (const photo of photos) {
      const fileName = `${profile.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${photo.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, photo, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError.message)
        if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('bucket')) {
          showToast('error', 'Bucket penyimpanan "report-images" belum dibuat. Buat di Supabase Dashboard > Storage.', 'Upload Gagal')
          return []
        }
        hasError = true
        continue
      }

      const { data: publicData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName)

      if (publicData?.publicUrl) {
        urls.push(publicData.publicUrl)
      }
    }

    if (hasError && urls.length === 0) {
      showToast('error', 'Gagal mengupload foto. Periksa koneksi atau penyimpanan.', 'Upload Gagal')
    } else if (hasError && urls.length > 0) {
      showToast('warning', `Beberapa foto gagal diupload (${photos.length - urls.length}/${photos.length})`, 'Upload Sebagian')
    }

    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) {
      showToast('error', 'Silakan login terlebih dahulu', 'Gagal')
      return
    }

    setSubmitting(true)

    try {
      if (isSimulator) {
        const { error } = simulator.createReport({
          citizen_id: profile.id,
          citizen_name: profile.full_name,
          citizen_phone: profile.phone,
          citizen_email: profile.email,
          title: formData.title,
          description: formData.description,
          category: formData.category as DamageCategory,
          severity: formData.severity as SeverityLevel,
          city: 'Pekanbaru',
          district: formData.district,
          subdistrict: '',
          street_name: formData.street_name,
          latitude: latitude || 0,
          longitude: longitude || 0,
          images_before: [],
          images_progress: [],
          images_after: [],
        })
        if (error) throw error
        showToast('success', 'Laporan berhasil dikirim!', 'Berhasil')
        navigate('/reports')
        return
      }

      if (!supabase) {
        showToast('error', 'Koneksi database tidak tersedia', 'Gagal')
        return
      }

      let imageUrls: string[] = []
      if (photos.length > 0) {
        setUploading(true)
        imageUrls = await uploadPhotos()
        setUploading(false)
      }

      // Pastikan profile user ada di tabel profiles (upsert)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: 'citizen',
          active: true,
        }, { onConflict: 'id' })
      if (profileError) {
        console.error('Gagal menyimpan profile:', profileError)
        throw profileError
      }

      // Juga upsert ke tabel users karena FK reports.citizen_id -> users(id)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: 'citizen',
          active: true,
        }, { onConflict: 'id' })
      if (userError) {
        console.error('Gagal menyimpan user:', userError)
        throw userError
      }

      const year = new Date().getFullYear()
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 900000) + 100000
      const ticketNumber = `JKP-${year}-${timestamp}-${random}`

      const { data: reportData, error } = await supabase
        .from('reports')
        .insert({
          ticket_number: ticketNumber,
          citizen_id: profile.id,
          citizen_name: profile.full_name,
          citizen_phone: profile.phone,
          citizen_email: profile.email,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          severity: formData.severity,
          city: 'Pekanbaru',
          district: formData.district,
          subdistrict: '',
          street_name: formData.street_name,
          latitude: latitude || 0,
          longitude: longitude || 0,
          images_before: imageUrls,
          status: 'Menunggu Verifikasi Admin',
          progress: 0,
        })
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      await supabase.from('status_history').insert({
        report_id: reportData.id,
        status: 'Laporan Berhasil Dikirim',
        notes: 'Laporan berhasil disubmit oleh masyarakat.',
        updated_by_name: profile.full_name,
        updated_by_role: 'citizen',
      })

      await supabase.from('reports').update({ status: 'Menunggu Verifikasi Admin' }).eq('id', reportData.id)

      await supabase.from('status_history').insert({
        report_id: reportData.id,
        status: 'Menunggu Verifikasi Admin',
        notes: 'Sistem mengalokasikan laporan ke antrean dinas.',
        updated_by_name: 'Sistem',
        updated_by_role: 'admin',
      })

      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Laporan Terkirim',
        message: `Laporan "${formData.title}" berhasil dikirim dan sedang menunggu verifikasi admin.`,
        report_id: reportData.id,
        ticket_number: ticketNumber,
      })

      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (adminUsers) {
        const adminNotifs = adminUsers.map((a) => ({
          user_id: a.id,
          title: 'Laporan Baru Masuk',
          message: `Laporan baru dari ${profile.full_name}: "${formData.title}"`,
          report_id: reportData.id,
          ticket_number: ticketNumber,
        }))
        await supabase.from('notifications').insert(adminNotifs)
      }

      showToast('success', 'Laporan berhasil dikirim!', 'Berhasil')
      navigate('/reports')
    } catch (err) {
      console.error('Submit error:', err)
      const errMsg = (err as Record<string, unknown>)?.message as string || ''
      if (errMsg?.includes('Failed to fetch') || errMsg?.includes('NetworkError') || errMsg?.includes('Network Error')) {
        showToast('error', 'Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.', 'Gagal')
      } else if (errMsg?.includes('duplicate key') || errMsg?.includes('409') || errMsg?.includes('ticket_number')) {
        showToast('error', 'Terjadi duplikasi nomor tiket. Silakan coba lagi.', 'Gagal')
      } else {
        showToast('error', errMsg || 'Gagal mengirim laporan', 'Gagal')
      }
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buat Laporan Baru</h1>
          <p className="text-muted-foreground mt-1">Laporkan kondisi kerusakan jalan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Jalan berlubang di depan kantor pemerintah"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deskripsi Permasalahan
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan kondisi kerusakan jalan secara detail..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kategori Kerusakan
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Pilih kategori...</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tingkat Kerusakan
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Pilih tingkat...</option>
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kecamatan
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                >
                  <option value="">Pilih kecamatan...</option>
                  {PEKANBARU_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nama Jalan
                </label>
                <input
                  type="text"
                  name="street_name"
                  value={formData.street_name}
                  onChange={handleChange}
                  placeholder="Jalan Diponegoro"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Pilih Lokasi di Peta</h3>
                </div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <LocateFixed className="w-4 h-4" />
                  Gunakan Lokasi Saya
                </button>
              </div>

              <ReportMap
                interactive
                selectedCoords={selectedCoords}
                onCoordsChange={handleCoordsChange}
                height="350px"
              />

              {latitude !== null && longitude !== null && (
                <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Latitude: <strong className="text-foreground">{latitude.toFixed(6)}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Longitude: <strong className="text-foreground">{longitude.toFixed(6)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(submitting || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Mengupload foto...' : submitting ? 'Mengirim laporan...' : 'Kirim Laporan'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-muted text-foreground py-2.5 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>

          {/* Sidebar - Photo Upload */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Upload Foto
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePhotoSelect}
                multiple
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Klik untuk upload foto</p>
                <p className="text-xs text-muted-foreground mt-1">Maksimal {MAX_PHOTOS} foto, format JPG/PNG/WEBP</p>
              </div>

              {previews.length > 0 && (
                <div className="mt-4 space-y-2">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-border group">
                      <img
                        src={preview}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
                        {(photos[i].size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {photos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {photos.length}/{MAX_PHOTOS} foto dipilih
                </p>
              )}
            </div>

            <div className="bg-primary/10 rounded-lg border border-primary/20 p-4">
              <h3 className="font-semibold text-primary mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-primary/80">
                <li>Upload foto yang jelas dan terang</li>
                <li>Sertakan landmark di dekat lokasi</li>
                <li>Fokus pada area kerusakan</li>
                <li>Klik peta untuk memilih lokasi</li>
                <li>Gunakan tombol "Lokasi Saya" untuk GPS otomatis</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
