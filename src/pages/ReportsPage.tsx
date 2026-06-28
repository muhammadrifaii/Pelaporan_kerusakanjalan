import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Report, ReportStatus } from '../types'
import { supabase } from '../lib/supabase'
import { Search, Filter, Trash2, Eye, X, ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const ALL_STATUSES: ReportStatus[] = [
  'Laporan Berhasil Dikirim',
  'Menunggu Verifikasi Admin',
  'Laporan Diterima',
  'Menunggu Penugasan Teknisi',
  'Teknisi Ditugaskan',
  'Survei Lapangan',
  'Sedang Dalam Perbaikan',
  'Menunggu Verifikasi Akhir',
  'Perbaikan Selesai',
  'Laporan Ditutup',
  'Ditolak',
]

const STATUS_COLORS: Record<string, string> = {
  'Laporan Berhasil Dikirim': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Menunggu Verifikasi Admin': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Laporan Diterima': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Menunggu Penugasan Teknisi': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Teknisi Ditugaskan': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Survei Lapangan': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Sedang Dalam Perbaikan': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'Menunggu Verifikasi Akhir': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Perbaikan Selesai': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Laporan Ditutup': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'Ditolak': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const ITEMS_PER_PAGE = 9

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

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      if (!supabase || !profile) return

      let query = supabase.from('reports').select('*')

      if (profile.role === 'citizen') {
        query = query.eq('citizen_id', profile.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setReports((data as Report[]) || [])
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal memuat laporan', 'Kesalahan')
    } finally {
      setLoading(false)
    }
  }, [profile, showToast])

  useEffect(() => {
    fetchReports()
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
    if (!confirm('Yakin ingin menghapus laporan ini?')) return
    setDeleting(reportId)
    try {
      if (!supabase) return
      const { error } = await supabase.from('reports').delete().eq('id', reportId)
      if (error) throw error
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      showToast('success', 'Laporan berhasil dihapus', 'Berhasil')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal menghapus laporan', 'Kesalahan')
    } finally {
      setDeleting(null)
    }
  }

  const canEdit = (report: Report) =>
    profile?.role === 'citizen' &&
    (report.status === 'Laporan Berhasil Dikirim' || report.status === 'Menunggu Verifikasi Admin')

  const canDelete = (report: Report) =>
    profile?.role === 'citizen' &&
    (report.status === 'Laporan Berhasil Dikirim' || report.status === 'Menunggu Verifikasi Admin')

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
          {profile?.role === 'citizen' ? 'Laporan Saya' : 'Semua Laporan'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {profile?.role === 'citizen' ? 'Kelola dan pantau semua laporan Anda' : 'Pantau seluruh laporan yang masuk'}
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
                  {report.images_before && report.images_before.length > 0 ? (
                    <img
                      src={report.images_before[0]}
                      alt={report.title}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1" />
                        <span className="text-muted-foreground text-xs">Tidak ada foto</span>
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
                      <button className="px-3 py-2 bg-warning text-white rounded text-xs font-medium hover:bg-warning/90 transition-colors">
                        Edit
                      </button>
                    )}
                    {canDelete(report) && (
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={deleting === report.id}
                        className="px-3 py-2 bg-danger text-white rounded text-xs font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
                    <img
                      key={i}
                      src={img}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
