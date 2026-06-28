import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMMM yyyy', { locale: id })
}

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMMM yyyy HH:mm', { locale: id })
}

export const formatTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: id })
}

export const formatRelativeTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

export const formatReportStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'Laporan Berhasil Dikirim': '📤 Berhasil Dikirim',
    'Menunggu Verifikasi Admin': '⏳ Menunggu Verifikasi',
    'Laporan Diterima': '✅ Diterima',
    'Menunggu Penugasan Teknisi': '👨‍🔧 Menunggu Penugasan',
    'Teknisi Ditugaskan': '📍 Teknisi Ditugaskan',
    'Survei Lapangan': '🔍 Survei Lapangan',
    'Sedang Dalam Perbaikan': '🔧 Sedang Diperbaiki',
    'Menunggu Verifikasi Akhir': '⏳ Verifikasi Akhir',
    'Perbaikan Selesai': '✅ Selesai',
    'Laporan Ditutup': '🔒 Ditutup',
    'Ditolak': '❌ Ditolak',
  }
  return statusMap[status] || status
}

export const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'Laporan Berhasil Dikirim': 'primary',
    'Menunggu Verifikasi Admin': 'warning',
    'Laporan Diterima': 'success',
    'Menunggu Penugasan Teknisi': 'warning',
    'Teknisi Ditugaskan': 'secondary',
    'Survei Lapangan': 'secondary',
    'Sedang Dalam Perbaikan': 'warning',
    'Menunggu Verifikasi Akhir': 'warning',
    'Perbaikan Selesai': 'success',
    'Laporan Ditutup': 'muted-foreground',
    'Ditolak': 'danger',
  }
  return colorMap[status] || 'primary'
}

export const formatSeverity = (severity: string) => {
  const severityMap: Record<string, string> = {
    Ringan: '🟢 Ringan',
    Sedang: '🟡 Sedang',
    Berat: '🔴 Berat',
  }
  return severityMap[severity] || severity
}

export const getSeverityColor = (severity: string) => {
  const colorMap: Record<string, string> = {
    Ringan: 'success',
    Sedang: 'warning',
    Berat: 'danger',
  }
  return colorMap[severity] || 'primary'
}

export const formatRating = (rating: number | null) => {
  if (!rating) return 'Belum diberi rating'
  return `${'⭐'.repeat(rating)} ${rating}/5`
}

export const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const formatCoordinates = (latitude: number, longitude: number) => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}
