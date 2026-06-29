import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Report, ReportStatus } from '../types'
import { supabase, isSimulator } from '../lib/supabase'
import { simulator } from '../lib/supabase-simulator'
import {
  Search, Filter, Trash2, Eye, X, ChevronLeft, ChevronRight, MapPin, Calendar,
  Edit3, AlertTriangle, Save, Loader2, ImageOff, CheckCircle, Ban
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const ALL_STATUSES: ReportStatus[] = [
  'Menunggu Verifikasi Admin',
  'Diverifikasi',
  'Menunggu Penugasan Teknisi',
  'Sedang Diproses',
  'Selesai',
  'Ditolak',
]

const STATUS_COLORS: Record<string, string> = {
  'Laporan Berhasil Dikirim': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Menunggu Verifikasi Admin': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Diverifikasi': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Menunggu Penugasan Teknisi': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Sedang Diproses': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Selesai': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Ditolak': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const ITEMS_PER_PAGE = 9
const ALL_CATEGORIES = [
  'Jalan Berlubang', 'Jalan Retak', 'Jalan Ambles', 'Aspal Rusak',
  'Drainase Rusak', 'Genangan', 'Marka Jalan Rusak', 'Jembatan Rusak', 'Lainnya'
]
const PEKANBARU_DISTRICTS = [
  'Bina Widya', 'Tuah Madani', 'Bukit Raya', 'Marpoyan Damai',
  'Tenayan Raya', 'Senapelan', 'Payung Sekaki', 'Rumbai'
]

export const ReportsPage = () => {
  const { profile } = useAuth()
  const { showToast } = useToast()

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    district: '',
    street_name: '',
    latitude: 0,
    longitude: 0,
  })
  const [editPhotos, setEditPhotos] = useState<File[]>([])
  const [editPreviews, setEditPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const [verifying, setVerifying] = useState<string | null>(null)
  const [changingStatus, setChangingStatus] = useState<string | null>(null)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    if (!supabase || !profile) {
      setChangingStatus(null)
      return
    }
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId)
      if (error) throw new Error(error.message)
      const { error: historyError } = await supabase.from('status_history').insert({
        report_id: reportId,
        status: newStatus,
        notes: `Status diubah oleh admin ${profile.full_name} menjadi "${newStatus}"`,
        updated_by_name: profile.full_name,
        updated_by_role: 'admin',
      })
      if (historyError) throw new Error(historyError.message)
      showToast('success', `Status laporan diubah menjadi "${newStatus}"`, 'Berhasil')
      fetchReports()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status'
      showToast('error', msg, 'Kesalahan')
    } finally {
      setChangingStatus(null)
    }
  }

  const handleImageError = useCallback((url: string) => {
    setBrokenImages((prev) => new Set(prev).add(url))
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      if (!profile) {
        setLoading(false)
        return
      }

      if (isSimulator) {
        const allReports = simulator.getReports()
        const filtered = profile.role === 'citizen'
          ? allReports.filter(r => r.citizen_id === profile.id)
          : allReports
        setReports(filtered)
      } else if (supabase) {
        let query = supabase.from('reports').select('*')

        if (profile.role === 'citizen') {
          query = query.eq('citizen_id', profile.id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        setReports((data as Report[]) || [])
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal memuat laporan', 'Kesalahan')
    } finally {
      setLoading(false)
    }
  }, [profile, showToast])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Realtime subscription for reports
  useEffect(() => {
    if (isSimulator) {
      const unsub = simulator.subscribe('reports', '*', () => {
        fetchReports()
      })
      return () => unsub()
    }

    if (!supabase) return
    const channel = supabase
      .channel('reports-page-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports()
      })
      .subscribe()
    return () => { supabase?.removeChannel(channel) }
  }, [fetchReports])

  const filtered = reports.filter((report) => {
    const matchSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      report.street_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || report.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [search, filterStatus])

  const handleDelete = async (reportId: string) => {
    setDeleting(reportId)
    try {
      if (!supabase) {
        showToast('error', 'Koneksi database tidak tersedia', 'Gagal')
        return
      }

      const report = reports.find(r => r.id === reportId)
      if (report?.images_before?.length) {
        for (const imgUrl of report.images_before) {
          const path = imgUrl.split('/').pop()
          if (path) {
            await supabase.storage.from('report-images').remove([path]).catch(() => {})
          }
        }
      }

      const { error } = await supabase.from('reports').delete().eq('id', reportId)
      if (error) {
        if (error.message?.includes('violates row-level security') || error.code === '42501') {
          throw new Error('Tidak memiliki izin untuk menghapus laporan. Hubungi admin.')
        }
        throw error
      }
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      showToast('success', 'Laporan berhasil dihapus', 'Berhasil')
      setShowDeleteConfirm(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus laporan'
      console.error('Delete error:', msg)
      showToast('error', msg, 'Kesalahan')
    } finally {
      setDeleting(null)
    }
  }

  const canEdit = (report: Report) =>
    profile?.role === 'citizen'
      ? report.status === 'Menunggu Verifikasi Admin'
      : profile?.role === 'admin'

  const canDelete = (report: Report) =>
    profile?.role === 'admin'
      ? true
      : profile?.role === 'citizen' && (report.status === 'Menunggu Verifikasi Admin' || report.status === 'Ditolak')

  const isCitizenBlockedFromDelete = (report: Report) =>
    profile?.role === 'citizen' && report.status !== 'Menunggu Verifikasi Admin' && report.status !== 'Ditolak'

  const adminStatuses = [
    'Menunggu Verifikasi Admin',
    'Diverifikasi',
    'Menunggu Penugasan Teknisi',
    'Sedang Diproses',
    'Selesai',
    'Ditolak',
  ]

  const handleEditClick = (report: Report) => {
    setEditingReport(report)
    setEditForm({
      title: report.title,
      description: report.description,
      category: report.category,
      district: report.district,
      street_name: report.street_name,
      latitude: report.latitude,
      longitude: report.longitude,
    })
    setEditPhotos([])
    setEditPreviews([])
  }

  const handleEditPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const validFiles: File[] = []
    const validPreviews: string[] = []
    for (const file of files) {
      if (allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024) {
        validFiles.push(file)
        validPreviews.push(URL.createObjectURL(file))
      }
    }
    setEditPhotos((prev) => [...prev, ...validFiles])
    setEditPreviews((prev) => [...prev, ...validPreviews])
  }

  const handleSaveEdit = async () => {
    if (!supabase || !editingReport) return
    setSaving(true)
    try {
      let imageUrls = editingReport.images_before || []
      if (editPhotos.length > 0) {
        const newUrls: string[] = []
        for (const photo of editPhotos) {
          const fileName = `${profile?.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${photo.name.split('.').pop()}`
          const { error: uploadError } = await supabase.storage
            .from('report-images')
            .upload(fileName, photo)
          if (uploadError) {
            console.error('Upload error:', uploadError)
            continue
          }
          const { data: publicData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName)
          if (publicData?.publicUrl) {
            newUrls.push(publicData.publicUrl)
          }
        }
        imageUrls = [...imageUrls, ...newUrls]
      }

      const { error } = await supabase
        .from('reports')
        .update({
          title: editForm.title,
          description: editForm.description,
          category: editForm.category,
          district: editForm.district,
          street_name: editForm.street_name,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          images_before: imageUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingReport.id)

      if (error) throw error

      showToast('success', 'Laporan berhasil diperbarui', 'Berhasil')
      setEditingReport(null)
      fetchReports()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menyimpan perubahan', 'Kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async (report: Report, action: 'verify' | 'reject') => {
    if (!supabase || !profile) return
    setVerifying(report.id)
    try {
      const newStatus: ReportStatus = action === 'verify' ? 'Diverifikasi' : 'Ditolak'
      const updates: Partial<Report> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }
      if (action === 'reject') {
        updates.rejection_reason = 'Laporan ditolak oleh admin'
      }

      const { error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', report.id)

      if (error) throw error

      await supabase.from('status_history').insert({
        report_id: report.id,
        status: newStatus,
        notes: action === 'verify'
          ? `Laporan diverifikasi oleh admin ${profile.full_name}`
          : `Laporan ditolak oleh admin ${profile.full_name}`,
        updated_by_name: profile.full_name,
        updated_by_role: 'admin',
      })

      showToast('success', action === 'verify' ? 'Laporan diverifikasi' : 'Laporan ditolak', 'Berhasil')
      setSelectedReport(null)
      fetchReports()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal memverifikasi laporan', 'Kesalahan')
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {profile?.role === 'citizen' ? 'Laporan Saya' : 'Manajemen Laporan'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {profile?.role === 'citizen' ? 'Kelola dan pantau semua laporan Anda' : 'Kelola seluruh laporan dan perubahan status'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 rounded-lg border border-border p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari judul, nomor, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          />
        </div>
        <div className="relative flex items-center gap-2 sm:w-64">
          <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'all')}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm bg-white dark:bg-slate-800"
          >
            <option value="all">Semua Status</option>
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {profile?.role === 'admin' ? (
        <>
          {paged.length === 0 ? (
            <div className="flex items-center justify-center py-16 px-4">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada laporan</h3>
                <p className="text-muted-foreground text-sm">
                  {search || filterStatus !== 'all'
                    ? 'Tidak ada laporan yang sesuai dengan filter Anda'
                    : 'Belum ada laporan yang masuk'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Foto</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Tiket</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Judul</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Pelapor</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Lokasi</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Tanggal</th>
                        <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                        <th className="text-center px-4 py-3 font-semibold text-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paged.map((report) => (
                        <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            {report.images_before?.[0] && !brokenImages.has(report.images_before[0]) ? (
                              <img
                                src={report.images_before[0]}
                                alt=""
                                className="w-10 h-10 rounded object-cover"
                                onError={() => handleImageError(report.images_before[0])}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <ImageOff className="w-5 h-5 text-muted-foreground/50" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">{report.ticket_number}</td>
                          <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{report.title}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-[150px] truncate">{report.citizen_name || '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-[150px] truncate">{report.street_name}, {report.district}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: id })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <select
                                value={report.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as ReportStatus
                                  setChangingStatus(report.id)
                                  handleStatusChange(report.id, newStatus)
                                }}
                                disabled={changingStatus === report.id}
                                className="px-2 py-1 text-xs border border-border rounded bg-white dark:bg-slate-800 max-w-[110px]"
                                title="Ubah status"
                              >
                                {adminStatuses.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {changingStatus === report.id && (
                                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                              )}
                              <button
                                onClick={() => setShowDeleteConfirm(report.id)}
                                className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-white'
                          : 'border border-border hover:bg-muted text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="text-sm text-muted-foreground text-center">
                Menampilkan {paged.length} dari {filtered.length} laporan
                {filtered.length !== reports.length && ` (difilter dari ${reports.length})`}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {paged.length === 0 ? (
            <div className="flex items-center justify-center py-16 px-4">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Tidak ada laporan</h3>
                <p className="text-muted-foreground text-sm">
                  {search || filterStatus !== 'all'
                    ? 'Tidak ada laporan yang sesuai dengan filter Anda'
                    : 'Belum ada laporan yang dibuat'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map((report) => (
                  <div key={report.id} className="bg-white dark:bg-slate-900 rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="relative">
                      {report.images_before && report.images_before.length > 0 && !brokenImages.has(report.images_before[0]) ? (
                        <img
                          src={report.images_before[0]}
                          alt={report.title}
                          className="w-full h-44 object-cover"
                          onError={() => handleImageError(report.images_before[0])}
                        />
                      ) : (
                        <div className="w-full h-44 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <div className="text-center">
                            <ImageOff className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1" />
                            <span className="text-muted-foreground text-xs">
                              {brokenImages.has(report.images_before?.[0] || '') ? 'Foto gagal dimuat' : 'Tidak ada foto'}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium shadow-sm ${STATUS_COLORS[report.status] || 'bg-gray-100 text-gray-800'}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug">{report.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{report.ticket_number}</p>
                      </div>

                      <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                        <p className="truncate">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {report.street_name}, {report.district}
                        </p>
                        <p>
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(report.created_at), 'dd MMM yyyy', { locale: id })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="flex-1 px-3 py-2 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>
                        {canEdit(report) && (
                          <button
                            onClick={() => handleEditClick(report)}
                            className="px-3 py-2 bg-warning text-white rounded text-xs font-medium hover:bg-warning/90 transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        {canDelete(report) && (
                          <button
                            onClick={() => setShowDeleteConfirm(report.id)}
                            className="px-3 py-2 bg-danger text-white rounded text-xs font-medium hover:bg-danger/90 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {isCitizenBlockedFromDelete(report) && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Laporan tidak dapat dihapus karena sedang diproses oleh admin.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-white'
                          : 'border border-border hover:bg-muted text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="text-sm text-muted-foreground text-center">
                Menampilkan {paged.length} dari {filtered.length} laporan
                {filtered.length !== reports.length && ` (difilter dari ${reports.length})`}
              </div>
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Hapus Laporan</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleting === showDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting === showDeleteConfirm && <Loader2 className="w-4 h-4 animate-spin" />}
                Ya, Hapus
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedReport(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Detail Laporan</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
                  {selectedReport.images_before && selectedReport.images_before.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.images_before.map((img, i) => (
                    <div key={i} className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                      {!brokenImages.has(img) ? (
                        <img
                          src={img}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(img)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <div className="text-center">
                            <ImageOff className="w-6 h-6 text-muted-foreground/50 mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground">Gagal dimuat</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Nomor Tiket</p>
                  <p className="font-semibold text-foreground font-mono">{selectedReport.ticket_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-0.5 ${STATUS_COLORS[selectedReport.status] || ''}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Kategori</p>
                  <p className="font-medium text-foreground">{selectedReport.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tingkat</p>
                  <p className="font-medium text-foreground">{selectedReport.severity}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Lokasi</p>
                  <p className="font-medium text-foreground">
                    {selectedReport.street_name}, Kec. {selectedReport.district}
                    {selectedReport.latitude && selectedReport.longitude && (
                      <span className="text-muted-foreground ml-2">
                        ({selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Dibuat</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedReport.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                  </p>
                </div>
                {selectedReport.updated_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Diperbarui</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(selectedReport.updated_at), 'dd MMM yyyy HH:mm', { locale: id })}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Judul</p>
                <p className="font-semibold text-foreground">{selectedReport.title}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Deskripsi</p>
                <p className="text-foreground text-sm leading-relaxed">{selectedReport.description}</p>
              </div>

              {selectedReport.admin_notes && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Catatan Admin</p>
                  <p className="text-foreground text-sm bg-muted/50 rounded-lg p-3">{selectedReport.admin_notes}</p>
                </div>
              )}

              {selectedReport.rejection_reason && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Alasan Ditolak</p>
                  <p className="text-danger text-sm bg-danger/5 rounded-lg p-3">{selectedReport.rejection_reason}</p>
                </div>
              )}

              {selectedReport.progress > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-2">Progress: {selectedReport.progress}%</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedReport.progress}%`, background: 'linear-gradient(135deg, #0F4C81, #1D9BF0)' }}
                    />
                  </div>
                </div>
              )}

              {selectedReport.citizen_name && (
                <div className="pt-4 border-t border-border">
                  <p className="text-muted-foreground text-xs">Dilaporkan oleh</p>
                  <p className="font-medium text-foreground">{selectedReport.citizen_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.citizen_email}</p>
                </div>
              )}

              {/* Admin Actions */}
              {profile?.role === 'admin' && (
                <div className="pt-4 border-t border-border space-y-3">
                  {selectedReport.status === 'Menunggu Verifikasi Admin' ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">Aksi Verifikasi</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVerify(selectedReport, 'verify')}
                          disabled={verifying === selectedReport.id}
                          className="flex-1 px-4 py-2.5 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {verifying === selectedReport.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Verifikasi
                        </button>
                        <button
                          onClick={() => handleVerify(selectedReport, 'reject')}
                          disabled={verifying === selectedReport.id}
                          className="flex-1 px-4 py-2.5 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Ban className="w-4 h-4" />
                          Tolak
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">Ubah Status Laporan</p>
                      <div className="flex gap-2">
                        <select
                          value={selectedReport.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as ReportStatus
                            if (!supabase || !profile) {
                              setVerifying(null)
                              return
                            }
                            setVerifying(selectedReport.id)
                            try {
                              const { error } = await supabase
                                .from('reports')
                                .update({ status: newStatus, updated_at: new Date().toISOString() })
                                .eq('id', selectedReport.id)
                              if (error) throw new Error(error.message)
                              const { error: historyError } = await supabase.from('status_history').insert({
                                report_id: selectedReport.id,
                                status: newStatus,
                                notes: `Status diubah oleh admin ${profile.full_name} menjadi "${newStatus}"`,
                                updated_by_name: profile.full_name,
                                updated_by_role: 'admin',
                              })
                              if (historyError) throw new Error(historyError.message)
                              showToast('success', `Status laporan diubah menjadi "${newStatus}"`, 'Berhasil')
                              setSelectedReport(null)
                              fetchReports()
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : 'Gagal mengubah status'
                              showToast('error', msg, 'Kesalahan')
                            } finally {
                              setVerifying(null)
                            }
                          }}
                          disabled={verifying === selectedReport.id}
                          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-white dark:bg-slate-800"
                        >
                          {adminStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setShowDeleteConfirm(selectedReport.id); setSelectedReport(null) }}
                      className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus Laporan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { if (!saving) setEditingReport(null) }}>
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Edit Laporan</h2>
              <button
                onClick={() => { if (!saving) setEditingReport(null) }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Judul Laporan</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deskripsi</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kategori</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kecamatan</label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, district: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    {PEKANBARU_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nama Jalan</label>
                <input
                  type="text"
                  value={editForm.street_name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, street_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tambah Foto</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleEditPhotoSelect}
                  multiple
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm"
                />
                {editPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {editPreviews.map((preview, i) => (
                      <img key={i} src={preview} alt={`New ${i}`} className="w-full h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                {editingReport.images_before && editingReport.images_before.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Foto saat ini ({editingReport.images_before.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {editingReport.images_before.map((img, i) => (
                        brokenImages.has(img) ? (
                          <div key={i} className="w-full h-20 rounded-lg bg-muted flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        ) : (
                          <img key={i} src={img} alt={`Current ${i}`} className="w-full h-20 object-cover rounded-lg" onError={() => handleImageError(img)} />
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
                <button
                  onClick={() => { if (!saving) setEditingReport(null) }}
                  className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
