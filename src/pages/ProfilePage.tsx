import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { User, Phone, MapPin, Lock, Camera, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const ProfilePage = () => {
  const { profile, updateProfile } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+62|0)[0-9]{9,12}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleSaveProfile = async () => {
    setLoading(true)

    if (!formData.full_name.trim()) {
      showToast('error', 'Nama lengkap tidak boleh kosong', 'Validasi Gagal')
      setLoading(false)
      return
    }

    if (!formData.phone.trim()) {
      showToast('error', 'Nomor telepon tidak boleh kosong', 'Validasi Gagal')
      setLoading(false)
      return
    }

    if (!validatePhoneNumber(formData.phone)) {
      showToast('error', 'Format nomor telepon tidak valid (gunakan format 08... atau +62...)', 'Validasi Gagal')
      setLoading(false)
      return
    }

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || '',
      })

      if (error) throw error

      showToast('success', 'Profil berhasil diperbarui', 'Berhasil')
      setEditMode(false)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal mengupdate profil', 'Kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('error', 'File harus berupa gambar', 'Tipe File Salah')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran file maksimal 5MB', 'File Terlalu Besar')
      return
    }

    setUploading(true)

    try {
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase?.storage.from('avatars').remove([oldPath])
        }
      }

      const fileName = `${profile?.id}-${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase!.storage.from('avatars').upload(fileName, file)

      if (uploadError) {
        if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('bucket')) {
          throw new Error('Bucket penyimpanan "avatars" belum dibuat. Buat bucket di Supabase Dashboard > Storage, atau jalankan SQL: INSERT INTO storage.buckets (id, name, public) VALUES (\'avatars\', \'avatars\', true);')
        }
        throw uploadError
      }

      const { data: publicData } = supabase!.storage.from('avatars').getPublicUrl(fileName)

      const { error: updateError } = await updateProfile({
        avatar_url: publicData.publicUrl,
      })

      if (updateError) throw updateError

      showToast('success', 'Foto profil berhasil diperbarui', 'Berhasil')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupload foto'
      console.error('Avatar upload error:', msg)
      showToast('error', msg, 'Kesalahan')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword) {
      showToast('error', 'Kata sandi saat ini tidak boleh kosong', 'Validasi Gagal')
      return
    }

    if (!passwordData.newPassword) {
      showToast('error', 'Kata sandi baru tidak boleh kosong', 'Validasi Gagal')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast('error', 'Kata sandi baru minimal 6 karakter', 'Validasi Gagal')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Kata sandi baru tidak cocok dengan konfirmasi', 'Validasi Gagal')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase!.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      showToast('success', 'Kata sandi berhasil diperbarui', 'Berhasil')
      setPasswordMode(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal mengubah kata sandi', 'Kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground mt-2">Kelola informasi profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-border p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <User className="w-16 h-16 text-primary/50" />
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploading}
            />

            <p className="text-sm text-muted-foreground text-center">
              {uploading ? 'Mengunggah...' : 'Klik kamera untuk mengubah foto'}
            </p>

            <div className="w-full mt-6 space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground break-words text-sm">{profile.email}</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-medium text-foreground capitalize text-sm">{profile.role}</p>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Bergabung</p>
                <p className="font-medium text-foreground text-sm">
                  {new Date(profile.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Informasi Profil</h2>
              {!editMode && (
                <button
                  onClick={() => {
                    setFormData({
                      full_name: profile?.full_name || '',
                      phone: profile?.phone || '',
                      address: profile?.address || '',
                    })
                    setEditMode(true)
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nama Lengkap
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nama lengkap Anda"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-muted/50 rounded-lg text-foreground text-sm">{profile.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nomor Telepon
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-muted/50 rounded-lg text-foreground flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {profile.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alamat
                </label>
                {editMode ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Alamat lengkap Anda"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-muted/50 rounded-lg text-foreground flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span>{profile.address || '-'}</span>
                  </p>
                )}
              </div>

              {editMode && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setFormData({
                        full_name: profile.full_name,
                        phone: profile.phone,
                        address: profile.address || '',
                      })
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-border p-6 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Keamanan</h2>
              {!passwordMode && (
                <button
                  onClick={() => setPasswordMode(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Ubah Kata Sandi
                </button>
              )}
            </div>

            {passwordMode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan kata sandi saat ini"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Kata Sandi Baru (minimal 6 karakter)
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Perbarui
                  </button>
                  <button
                    onClick={() => {
                      setPasswordMode(false)
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
