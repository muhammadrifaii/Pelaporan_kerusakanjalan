import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { ReactNode } from 'react'
import type { Notification } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, LogOut, Moon, Sun, Bell, ChevronLeft, ChevronRight,
  LayoutDashboard, FileText, PlusCircle, User, Users, Wrench,
  ListChecks, Check, Trash2, ArrowLeft
} from 'lucide-react'
import type { UserRole } from '../types'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const roleTheme: Record<UserRole, {
  primary: string
  gradient: string
  light: string
  sidebarBg: string
  sidebarActive: string
  sidebarHover: string
  iconBg: string
  ring: string
  label: string
}> = {
  citizen: {
    primary: '#0F4C81',
    gradient: 'linear-gradient(135deg, #0F4C81, #1D9BF0)',
    light: '#E8F0FE',
    sidebarBg: '#0C1E33',
    sidebarActive: 'rgba(15, 76, 129, 0.3)',
    sidebarHover: 'rgba(255, 255, 255, 0.06)',
    iconBg: '#0F4C81',
    ring: 'ring-blue-500',
    label: 'Warga',
  },
  admin: {
    primary: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626, #FB923C)',
    light: '#FEE2E2',
    sidebarBg: '#1A0A0A',
    sidebarActive: 'rgba(220, 38, 38, 0.3)',
    sidebarHover: 'rgba(255, 255, 255, 0.06)',
    iconBg: '#DC2626',
    ring: 'ring-red-500',
    label: 'Admin',
  },
  coordinator: {
    primary: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    light: '#EDE9FE',
    sidebarBg: '#170C26',
    sidebarActive: 'rgba(124, 58, 237, 0.3)',
    sidebarHover: 'rgba(255, 255, 255, 0.06)',
    iconBg: '#7C3AED',
    ring: 'ring-purple-500',
    label: 'Koordinator',
  },
  technician: {
    primary: '#16A34A',
    gradient: 'linear-gradient(135deg, #16A34A, #4ADE80)',
    light: '#DCFCE7',
    sidebarBg: '#0A1F0F',
    sidebarActive: 'rgba(22, 163, 74, 0.3)',
    sidebarHover: 'rgba(255, 255, 255, 0.06)',
    iconBg: '#16A34A',
    ring: 'ring-green-500',
    label: 'Teknisi',
  },
}

interface MenuItem {
  label: string
  href: string
  icon: React.ElementType
  highlight?: boolean
}

const roleMenus: Record<UserRole, MenuItem[]> = {
  citizen: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Buat Laporan', href: '/report/create', icon: PlusCircle, highlight: true },
    { label: 'Laporan Saya', href: '/reports', icon: FileText },
    { label: 'Profil Saya', href: '/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manajemen Laporan', href: '/admin/reports', icon: FileText },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
    { label: 'Profil Saya', href: '/profile', icon: User },
  ],
  coordinator: [
    { label: 'Dashboard', href: '/coordinator/dashboard', icon: LayoutDashboard },
    { label: 'Penugasan', href: '/coordinator/assignments', icon: ListChecks },
    { label: 'Teknisi', href: '/coordinator/technicians', icon: Wrench },
    { label: 'Profil Saya', href: '/profile', icon: User },
  ],
  technician: [
    { label: 'Dashboard', href: '/technician/dashboard', icon: LayoutDashboard },
    { label: 'Tugas Saya', href: '/technician/tasks', icon: FileText },
    { label: 'Profil Saya', href: '/profile', icon: User },
  ],
}

interface DashboardLayoutProps {
  children?: ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { profile, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const role = profile?.role || 'citizen'
  const theme = roleTheme[role]
  const menuItems = roleMenus[role]

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = useCallback(async () => {
    if (!supabase || !profile) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!error && data) {
        setNotifications(data as Notification[])
      }
    } catch {
      // silent
    }
  }, [profile])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!supabase || !profile) return
    const sb = supabase
    if (!sb) return
    const channel = sb
      .channel('notif-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, () => {
        fetchNotifications()
      })
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [profile, fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (href: string) => location.pathname === href

  const handleMarkRead = async (notifId: string) => {
    if (!supabase) return
    await supabase.from('notifications').update({ read: true }).eq('id', notifId)
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)))
  }

  const handleMarkAllRead = async () => {
    if (!supabase || !profile) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).is('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('success', 'Semua notifikasi ditandai sudah dibaca', 'Berhasil')
  }

  const handleDeleteNotif = async (notifId: string) => {
    if (!supabase) return
    await supabase.from('notifications').delete().eq('id', notifId)
    setNotifications((prev) => prev.filter((n) => n.id !== notifId))
  }

  const handleNotifClick = (notif: Notification) => {
    setNotifOpen(false)
    if (!notif.read) handleMarkRead(notif.id)
    const path = profile?.role === 'citizen' ? '/reports' : `/${role}/reports`
    navigate(path)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background transition-colors duration-200">

        {/* SIDEBAR */}
        <aside
          className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
          style={{ backgroundColor: theme.sidebarBg }}
        >
          {/* Sidebar Header */}
          <div className={`flex items-center h-16 px-4 border-b border-white/10 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: theme.gradient }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <span className="text-white font-bold text-base">JalanKita</span>
                    <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded font-medium"
                      style={{ background: theme.light, color: theme.primary }}>
                      {theme.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar User Info */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-4 border-b border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
                    style={{ background: theme.gradient }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                        {profile?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">{profile?.full_name}</p>
                    <p className="text-white/50 text-xs capitalize truncate">
                      {role === 'citizen' ? 'Warga' : role === 'admin' ? 'Admin PUPR' : role === 'coordinator' ? 'Koordinator Lapangan' : 'Teknisi Lapangan'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              if (item.highlight) {
                return (
                  <button
                    key={item.href}
                    onClick={() => { navigate(item.href); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      sidebarCollapsed ? 'lg:justify-center' : ''
                    }`}
                    style={{
                      background: theme.gradient,
                      color: 'white',
                      boxShadow: `0 4px 12px ${theme.primary}40`,
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden whitespace-nowrap text-sm"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                )
              }

              return (
                <button
                  key={item.href}
                  onClick={() => { navigate(item.href); setSidebarOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    sidebarCollapsed ? 'lg:justify-center' : ''
                  } ${active
                    ? 'text-white font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={active ? { backgroundColor: theme.sidebarActive } : {}}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !sidebarCollapsed && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: theme.gradient }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 pb-3 space-y-1 border-t border-white/10 pt-3">
            <button
              onClick={() => { navigate('/'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all ${
                sidebarCollapsed ? 'lg:justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Ke Beranda' : undefined}
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                  >
                    Ke Beranda
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all ${
                sidebarCollapsed ? 'lg:justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Keluar' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                  >
                    Keluar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border items-center justify-center hover:bg-muted transition-colors shadow-sm"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 lg:hidden z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          {/* Navbar */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ background: theme.primary }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Panel */}
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-border overflow-hidden"
                        style={{ maxHeight: '480px' }}
                      >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <h3 className="font-semibold text-foreground text-sm">Notifikasi</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs font-medium flex items-center gap-1 hover:underline"
                              style={{ color: theme.primary }}
                            >
                              <Check className="w-3 h-3" />
                              Tandai Dibaca
                            </button>
                          )}
                        </div>

                        <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-border">
                              {notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                                    !notif.read ? 'bg-primary/5' : ''
                                  }`}
                                  onClick={() => handleNotifClick(notif)}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        {!notif.read && (
                                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: theme.primary }} />
                                        )}
                                        <p className="text-xs font-semibold text-foreground truncate">
                                          {notif.title}
                                        </p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                        {notif.message}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                                        {format(new Date(notif.created_at), 'dd MMM HH:mm', { locale: id })}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteNotif(notif.id)
                                      }}
                                      className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground/50 hover:text-danger flex-shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="hidden sm:flex items-center gap-3 ml-2 pl-2 border-l border-border">
                  <div className="w-8 h-8 rounded-full overflow-hidden"
                    style={{ background: theme.gradient }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xs">
                        {profile?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm hidden md:block">
                    <p className="font-medium text-foreground">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {role === 'citizen' ? 'Warga' : role === 'admin' ? 'Admin PUPR' : role === 'coordinator' ? 'Koordinator' : 'Teknisi'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
