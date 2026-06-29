import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { motion } from 'framer-motion'
import type { Report, UserRole } from '../types'
import { supabase, isSimulator } from '../lib/supabase'
import { simulator } from '../lib/supabase-simulator'
import { StatCharts } from '../components/dashboard/StatCharts'
import {
  TrendingUp, PlusCircle, FileText, CheckCircle, Clock,
  ArrowRight, ClipboardList, Settings,
  ChevronRight, Ban,
  MapPin, Users, Activity
} from 'lucide-react'

const roleTheme: Record<UserRole, {
  primary: string
  gradient: string
  light: string
}> = {
  citizen: { primary: '#0F4C81', gradient: 'linear-gradient(135deg, #0F4C81, #1D9BF0)', light: '#E8F0FE' },
  admin: { primary: '#DC2626', gradient: 'linear-gradient(135deg, #DC2626, #FB923C)', light: '#FEE2E2' },
  coordinator: { primary: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', light: '#EDE9FE' },
  technician: { primary: '#16A34A', gradient: 'linear-gradient(135deg, #16A34A, #4ADE80)', light: '#DCFCE7' },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }
  })
}

interface StatData {
  total: number
  processing: number
  completed: number
  rejected: number
  accepted: number
  assigned: number
  surveying: number
  repairing: number
  pendingVerification: number
}

const defaultStats: StatData = {
  total: 0, processing: 0, completed: 0, rejected: 0,
  accepted: 0, assigned: 0, surveying: 0, repairing: 0, pendingVerification: 0
}

interface StatCardProps {
  title: string
  value: string
  color: string
  icon: React.ReactNode
  gradient?: string
}

const StatCard = ({ title, value, color, icon, gradient }: StatCardProps) => (
  <div
    className="relative rounded-2xl border p-5 overflow-hidden group cursor-default"
    style={gradient ? {
      background: gradient,
      borderColor: 'transparent'
    } : {
      backgroundColor: `${color}08`,
      borderColor: `${color}20`
    }}
  >
    {gradient && (
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
      </div>
    )}
    <div className="relative z-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: gradient ? 'rgba(255,255,255,0.7)' : `${color}99` }}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight" style={{ color: gradient ? '#ffffff' : color }}>
            {value}
          </p>
        </div>
        <div
          className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: gradient ? 'rgba(255,255,255,0.15)' : `${color}15`,
            color: gradient ? '#ffffff' : color,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  </div>
)

export const DashboardPage = () => {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const role = profile?.role || 'citizen'
  const theme = roleTheme[role]

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatData>(defaultStats)
  const [totalUsers, setTotalUsers] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (!profile) {
        setLoading(false)
        return
      }

      let reportsList: Report[] = []

      if (isSimulator) {
        const allReports = simulator.getReports()
        reportsList = profile.role === 'citizen'
          ? allReports.filter(r => r.citizen_id === profile.id)
          : allReports
      } else if (supabase) {
        let query = supabase.from('reports').select('*')

        if (profile.role === 'citizen') {
          query = query.eq('citizen_id', profile.id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        reportsList = (data as Report[]) || []
      }

      setReports(profile?.role === 'admin' ? reportsList : reportsList.slice(0, 5))

      const s: StatData = {
        total: reportsList.length,
        processing: reportsList.filter(r =>
          r.status === 'Menunggu Verifikasi Admin' || r.status === 'Diverifikasi' || r.status === 'Sedang Diproses'
        ).length,
        completed: reportsList.filter(r => r.status === 'Selesai').length,
        rejected: reportsList.filter(r => r.status === 'Ditolak').length,
        accepted: reportsList.filter(r => r.status === 'Diverifikasi' || r.status === 'Menunggu Penugasan Teknisi').length,
        assigned: reportsList.filter(r => r.status === 'Menunggu Penugasan Teknisi').length,
        surveying: reportsList.filter(r => r.status === 'Sedang Diproses').length,
        repairing: reportsList.filter(r => r.status === 'Sedang Diproses').length,
        pendingVerification: reportsList.filter(r => r.status === 'Sedang Diproses').length,
      }
      setStats(s)
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Gagal memuat data', 'Kesalahan')
    } finally {
      setLoading(false)
    }
  }, [profile, showToast])

  const fetchUserCount = useCallback(async () => {
    if (isSimulator) {
      const users = simulator.getUsers()
      setTotalUsers(users.length)
      return
    }
    const sb = supabase
    if (!sb) return
    try {
      let { count } = await sb
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      if (count !== null && count > 0) {
        setTotalUsers(count)
        return
      }
      const { count: usersCount } = await sb
        .from('users')
        .select('*', { count: 'exact', head: true })
      if (usersCount !== null) {
        setTotalUsers(usersCount)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchData()
    if (role === 'admin') fetchUserCount()
  }, [profile, fetchData, fetchUserCount, role])

  useEffect(() => {
    if (isSimulator) {
      const unsub = simulator.subscribe('reports', '*', () => {
        fetchData()
      })
      return () => unsub()
    }
    const sb = supabase
    if (!sb) return
    const channel = sb
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [fetchData])

  if (loading) {
    return <DashboardSkeleton role={role} theme={theme} />
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Laporan Berhasil Dikirim': '#3B82F6',
      'Menunggu Verifikasi Admin': '#F59E0B',
      'Diverifikasi': '#10B981',
      'Menunggu Penugasan Teknisi': '#8B5CF6',
      'Sedang Diproses': '#F97316',
      'Selesai': '#10B981',
      'Ditolak': '#EF4444',
    }
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${colors[status] || '#64748B'}15`, color: colors[status] || '#64748B' }}
      >
        {status}
      </span>
    )
  }

  const progressBar = (progress: number) => (
    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${progress}%`, background: theme.gradient }}
      />
    </div>
  )

  // ========== Chart Data ==========
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const monthlyData = monthNames.map((name, i) => ({
    name,
    reports: reports.filter(r => {
      const d = new Date(r.created_at)
      return d.getMonth() === i
    }).length,
  }))

  const districtCounts: Record<string, number> = {}
  reports.forEach(r => {
    if (r.district) districtCounts[r.district] = (districtCounts[r.district] || 0) + 1
  })
  const districtData = Object.entries(districtCounts).map(([name, count]) => ({ name, count }))

  const severityCounts: Record<string, number> = { Ringan: 0, Sedang: 0, Berat: 0 }
  reports.forEach(r => {
    if (r.severity && severityCounts[r.severity] !== undefined) severityCounts[r.severity]++
  })
  const severityData = [
    { name: 'Ringan', value: severityCounts.Ringan, color: '#22C55E' },
    { name: 'Sedang', value: severityCounts.Sedang, color: '#F59E0B' },
    { name: 'Berat', value: severityCounts.Berat, color: '#EF4444' },
  ]

  const categoryCounts: Record<string, number> = {}
  reports.forEach(r => {
    if (r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))

  // ========== CITIZEN DASHBOARD ==========
  if (role === 'citizen') {
    return (
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Selamat Datang, {profile?.full_name?.split(' ')[0]}</h1>
            <p className="text-muted-foreground mt-1">Pantau dan kelola laporan kerusakan jalan Anda</p>
          </div>
          <button
            onClick={() => navigate('/report/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm shadow-lg transition-all hover:shadow-xl"
            style={{ background: theme.gradient }}
          >
            <PlusCircle className="w-4 h-4" />
            Buat Laporan Baru
          </button>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={1}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard title="Total Laporan" value={String(stats.total)} color={theme.primary} icon={<FileText className="w-5 h-5" />} />
          <StatCard title="Diproses" value={String(stats.processing)} color="#F59E0B" icon={<Clock className="w-5 h-5" />} />
          <StatCard title="Selesai" value={String(stats.completed)} color="#10B981" icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard title="Ditolak" value={String(stats.rejected)} color="#EF4444" icon={<Ban className="w-5 h-5" />} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={2}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: PlusCircle, label: 'Buat Laporan Baru', desc: 'Laporkan kerusakan jalan', onClick: () => navigate('/report/create'), color: theme.primary },
            { icon: FileText, label: 'Lihat Laporan Saya', desc: 'Riwayat semua laporan', onClick: () => navigate('/reports'), color: '#8B5CF6' },
            { icon: MapPin, label: 'Lacak Progress', desc: 'Pantau status laporan', onClick: () => navigate('/reports'), color: '#F59E0B' },
          ].map((action, i) => (
            <button key={i} onClick={action.onClick}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          ))}
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={3}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Laporan Terbaru</h2>
            {reports.length > 0 && (
              <button onClick={() => navigate('/reports')} className="text-sm font-medium flex items-center gap-1 transition-colors"
                style={{ color: theme.primary }}>
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Belum Ada Laporan</h3>
              <p className="text-sm text-muted-foreground mb-4">Anda belum membuat laporan kerusakan jalan</p>
              <button
                onClick={() => navigate('/report/create')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
                style={{ background: theme.gradient }}
              >
                <PlusCircle className="w-4 h-4" />
                Buat Laporan Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reports.map((report, _i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: _i * 0.05 }}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/reports')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary font-semibold">{report.ticket_number}</span>
                      </div>
                      <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.street_name} &middot; {new Date(report.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {statusBadge(report.status)}
                      <div className="mt-2 w-24 ml-auto">
                        {progressBar(report.progress)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // ========== ADMIN DASHBOARD ==========
  if (role === 'admin') {
    return (
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Admin PUPR</h1>
          <p className="text-muted-foreground mt-1">Overview sistem pelaporan kerusakan jalan Pekanbaru</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={1}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard title="Total Laporan" value={String(stats.total)} color={theme.primary} icon={<FileText className="w-5 h-5" />} />
          <StatCard title="Total Pengguna" value={String(totalUsers)} color="#8B5CF6" icon={<Users className="w-5 h-5" />} />
          <StatCard title="Selesai" value={String(stats.completed)} color="#10B981" icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard title="Menunggu Verifikasi" value={String(reports.filter(r => r.status === 'Menunggu Verifikasi Admin').length)} color="#F59E0B" icon={<Clock className="w-5 h-5" />} />
        </motion.div>

        {stats.total > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={2}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Diterima', value: stats.accepted, color: '#10B981' },
              { label: 'Ditugaskan', value: stats.assigned, color: '#F97316' },
              { label: 'Survey', value: stats.surveying, color: '#6366F1' },
              { label: 'Diperbaiki', value: stats.repairing, color: '#A855F7' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Admin Verification Queue */}
        {reports.filter(r => r.status === 'Menunggu Verifikasi Admin').length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={2.5}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">Antrean Verifikasi</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-yellow-500">
                  {reports.filter(r => r.status === 'Menunggu Verifikasi Admin').length}
                </span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {reports.filter(r => r.status === 'Menunggu Verifikasi Admin').slice(0, 5).map((report) => (
                <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary font-semibold">{report.ticket_number}</span>
                      </div>
                      <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {report.citizen_name} &middot; {report.district} &middot; {report.street_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={async () => {
                          if (!supabase || !profile) return
                          try {
                            await supabase.from('reports').update({
                              status: 'Diverifikasi',
                              updated_at: new Date().toISOString(),
                            }).eq('id', report.id)
                            await supabase.from('status_history').insert({
                              report_id: report.id,
                              status: 'Diverifikasi',
                              notes: `Laporan diverifikasi oleh admin ${profile.full_name}`,
                              updated_by_name: profile.full_name,
                              updated_by_role: 'admin',
                            })
                            showToast('success', `Laporan ${report.ticket_number} diverifikasi`, 'Berhasil')
                            fetchData()
                          } catch (err) {
                            showToast('error', 'Gagal memverifikasi laporan', 'Kesalahan')
                          }
                        }}
                        className="px-3 py-1.5 bg-success text-white rounded-lg text-xs font-medium hover:bg-success/90 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verifikasi
                      </button>
                      <button
                        onClick={async () => {
                          if (!supabase || !profile) return
                          try {
                            await supabase.from('reports').update({
                              status: 'Ditolak',
                              rejection_reason: 'Laporan ditolak oleh admin',
                              updated_at: new Date().toISOString(),
                            }).eq('id', report.id)
                            await supabase.from('status_history').insert({
                              report_id: report.id,
                              status: 'Ditolak',
                              notes: `Laporan ditolak oleh admin ${profile.full_name}`,
                              updated_by_name: profile.full_name,
                              updated_by_role: 'admin',
                            })
                            showToast('success', `Laporan ${report.ticket_number} ditolak`, 'Berhasil')
                            fetchData()
                          } catch (err) {
                            showToast('error', 'Gagal menolak laporan', 'Kesalahan')
                          }
                        }}
                        className="px-3 py-1.5 bg-danger text-white rounded-lg text-xs font-medium hover:bg-danger/90 transition-colors flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts */}
        {stats.total > 0 && (
          <StatCharts
            monthlyData={monthlyData}
            districtData={districtData}
            severityData={severityData}
            categoryData={categoryData}
          />
        )}

        {/* Recent Reports */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={3}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Laporan Terbaru</h2>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-sm font-medium flex items-center gap-1 text-primary hover:underline"
            >
              Kelola Laporan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {reports.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Belum Ada Laporan</h3>
              <p className="text-sm text-muted-foreground">Belum ada laporan yang masuk ke sistem</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {report.images_before?.[0] && (
                        <img src={report.images_before[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{report.ticket_number} &middot; {report.citizen_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {statusBadge(report.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // ========== COORDINATOR DASHBOARD ==========
  if (role === 'coordinator') {
    const pendingAssignment = reports.filter(r => r.status === 'Menunggu Penugasan Teknisi')
    const activeReports = reports.filter(r =>
      ['Sedang Diproses'].includes(r.status)
    )

    return (
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Koordinator</h1>
          <p className="text-muted-foreground mt-1">Monitoring laporan masuk dan distribusi tugas teknisi</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={1}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard title="Laporan Masuk" value={String(reports.length)} color={theme.primary} icon={<FileText className="w-5 h-5" />} />
          <StatCard title="Menunggu Tugas" value={String(pendingAssignment.length)} color="#F59E0B" icon={<Clock className="w-5 h-5" />} />
          <StatCard title="Sedang Aktif" value={String(activeReports.length)} color="#8B5CF6" icon={<Activity className="w-5 h-5" />} />
          <StatCard title="Selesai" value={String(stats.completed)} color="#10B981" icon={<CheckCircle className="w-5 h-5" />} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={2}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">Menunggu Penugasan</h2>
              {pendingAssignment.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ background: theme.primary }}>
                  {pendingAssignment.length}
                </span>
              )}
            </div>
          </div>

          {pendingAssignment.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Semua laporan sudah ditugaskan</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingAssignment.map((report) => (
                <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {report.street_name} &middot; {report.district}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{report.category}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={3}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Laporan Aktif</h2>
          </div>
          {activeReports.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Tidak ada laporan yang sedang aktif</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeReports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{report.street_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {statusBadge(report.status)}
                      <div className="mt-2 w-20 ml-auto">{progressBar(report.progress)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Coordinator charts */}
        {stats.total > 0 && (
          <StatCharts
            monthlyData={monthlyData}
            districtData={districtData}
            severityData={severityData}
            categoryData={categoryData}
          />
        )}
      </div>
    )
  }

  // ========== TECHNICIAN DASHBOARD ==========
  if (role === 'technician') {
    const myTasks = reports.filter(r => r.technician_id === profile?.id)
    const activeTasks = myTasks.filter(r => r.status !== 'Selesai' && r.status !== 'Ditolak')
    const completedTasks = myTasks.filter(r => r.status === 'Selesai')

    return (
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Teknisi</h1>
          <p className="text-muted-foreground mt-1">Kelola tugas perbaikan jalan Anda</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={1}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard title="Tugas Saya" value={String(myTasks.length)} color={theme.primary} icon={<ClipboardList className="w-5 h-5" />} />
          <StatCard title="Aktif" value={String(activeTasks.length)} color="#F59E0B" icon={<Settings className="w-5 h-5" />} />
          <StatCard title="Selesai" value={String(completedTasks.length)} color="#10B981" icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard title="Progress" value={myTasks.length > 0 ? `${Math.round(myTasks.reduce((a, r) => a + r.progress, 0) / myTasks.length)}%` : '0%'} color="#8B5CF6" icon={<TrendingUp className="w-5 h-5" />} />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={2}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Tugas Aktif</h2>
          </div>
          {activeTasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Semua Tugas Selesai</h3>
              <p className="text-sm text-muted-foreground">Tidak ada tugas aktif saat ini</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeTasks.map((report, _i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: _i * 0.05 }}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {report.street_name} &middot; {report.district}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {statusBadge(report.status)}
                      <div className="mt-2">{progressBar(report.progress)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {completedTasks.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={3}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">Baru Saja Selesai</h2>
            </div>
            <div className="divide-y divide-border">
              {completedTasks.slice(0, 3).map((report) => (
                <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{report.street_name}</p>
                    </div>
                    {statusBadge(report.status)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return null
}

const DashboardSkeleton = ({ theme }: { role?: UserRole; theme: typeof roleTheme.admin }) => {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded-lg" style={{ backgroundColor: `${theme.primary}15` }} />
        <div className="h-4 w-48 rounded-lg mt-2" style={{ backgroundColor: `${theme.primary}10` }} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: `${theme.primary}08` }} />
        ))}
      </div>

      <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: `${theme.primary}05` }} />
    </div>
  )
}
