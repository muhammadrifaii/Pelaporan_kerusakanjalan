import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  Menu, X, ChevronDown, ChevronUp, MapPin, Route, FileText,
  CheckCircle, Users, Settings, Clock, Shield, ArrowRight,
  Star, Send, BarChart3, Phone, Mail, MapPinned, Building2,
  Globe, ChevronRight, Activity
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  })
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const features = [
  {
    icon: FileText,
    title: 'Lapor Mudah',
    desc: 'Laporkan kerusakan jalan dalam hitungan menit melalui form sederhana dengan foto dan lokasi.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MapPin,
    title: 'Tracking Real-time',
    desc: 'Pantau progres penanganan laporan Anda secara real-time dari awal hingga selesai.',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: CheckCircle,
    title: 'Verifikasi Transparan',
    desc: 'Setiap laporan diverifikasi secara transparan oleh Dinas PUPR Pekanbaru.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Users,
    title: 'Kolaborasi Tim',
    desc: 'Koordinasi antara admin, koordinator, dan teknisi lapangan yang efisien.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: BarChart3,
    title: 'Data & Analitik',
    desc: 'Dashboard analitik untuk memantau tren kerusakan jalan di seluruh Pekanbaru.',
    color: 'from-rose-500 to-rose-600'
  },
  {
    icon: Shield,
    title: 'Akuntabel',
    desc: 'Setiap tahapan penanganan terekam dan dapat dipertanggungjawabkan.',
    color: 'from-cyan-500 to-cyan-600'
  }
]

const steps = [
  { num: '1', icon: FileText, title: 'Buat Laporan', desc: 'Isi detail kerusakan, unggah foto, dan tandai lokasi di peta.' },
  { num: '2', icon: CheckCircle, title: 'Verifikasi Admin', desc: 'Tim Dinas PUPR memverifikasi dan menentukan prioritas penanganan.' },
  { num: '3', icon: Users, title: 'Penugasan Teknisi', desc: 'Koordinator menugaskan teknisi lapangan untuk survei dan perbaikan.' },
  { num: '4', icon: Settings, title: 'Proses Perbaikan', desc: 'Teknisi melakukan perbaikan dan mengunggah dokumentasi progres.' },
  { num: '5', icon: Shield, title: 'Verifikasi Akhir', desc: 'Admin memeriksa hasil perbaikan dan menyetujui penyelesaian.' },
  { num: '6', icon: Star, title: 'Ulasan & Selesai', desc: 'Warga memberikan rating & ulasan. Laporan resmi ditutup.' }
]

const testimonials = [
  {
    name: 'Rudi Hermawan',
    role: 'Warga Pekanbaru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    text: 'Saya melapor lubang di Jl. H.R. Soebrantas, dalam 2 hari sudah ditangani. Mantap!',
    rating: 5
  },
  {
    name: 'Siti Nurhaliza',
    role: 'Warga Marpoyan Damai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    text: 'Drainase depan rumah tersumbat bertahun-tahun, setelah lapor via JalanKita langsung dibersihkan.',
    rating: 5
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Pengusaha di Senapelan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    text: 'Aplikasi yang sangat membantu. Sekarang saya bisa pantau langsung progres perbaikan jalan.',
    rating: 4
  }
]

const faqs = [
  {
    q: 'Apa itu JalanKita Pekanbaru?',
    a: 'JalanKita Pekanbaru adalah platform pelaporan kerusakan jalan dan infrastruktur publik yang dikelola oleh Dinas PUPR Kota Pekanbaru. Warga dapat melaporkan kerusakan jalan, drainase, jembatan, dan fasilitas umum lainnya.'
  },
  {
    q: 'Bagaimana cara melaporkan kerusakan?',
    a: 'Cukup daftar akun, login, lalu klik "Buat Laporan". Isi detail kerusakan, unggah foto lokasi, dan tandai posisi di peta. Laporan Anda akan segera masuk ke sistem Dinas PUPR.'
  },
  {
    q: 'Berapa lama waktu penanganan laporan?',
    a: 'Waktu penanganan bervariasi tergantung tingkat kerusakan dan prioritas. Kerusakan berat di jalan arteri biasanya ditangani dalam 1-3 hari kerja, sementara kerusakan ringan di jalan lingkungan 5-7 hari kerja.'
  },
  {
    q: 'Apakah saya bisa melacak progres laporan?',
    a: 'Tentu! Setiap laporan memiliki nomor tiket unik. Anda bisa melacak progres secara real-time melalui dashboard pribadi dan akan mendapat notifikasi setiap ada perubahan status.'
  },
  {
    q: 'Siapa yang menangani laporan saya?',
    a: 'Laporan Anda akan diverifikasi oleh Admin Dinas PUPR, kemudian dikoordinasikan oleh Koordinator Lapangan, dan dikerjakan oleh Teknisi Lapangan yang profesional dan berpengalaman.'
  },
  {
    q: 'Apakah aplikasi ini gratis?',
    a: 'Ya, JalanKita Pekanbaru sepenuhnya gratis untuk seluruh warga Kota Pekanbaru. Aplikasi ini adalah bagian dari program Smart City Pemerintah Kota Pekanbaru.'
  }
]

export const LandingPage = () => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (user && profile) {
    const dashboardRoutes: Record<string, string> = {
      citizen: '/dashboard',
      admin: '/admin/dashboard',
      coordinator: '/coordinator/dashboard',
      technician: '/technician/dashboard',
    }
    return <Navigate to={dashboardRoutes[profile.role] || '/dashboard'} replace />
  }

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroStyle = {
    background: 'linear-gradient(135deg, #0A1628 0%, #0F4C81 50%, #1A6BA8 100%)'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-xl ${scrollY > 50 ? 'text-primary' : 'text-white'}`}>JalanKita</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${scrollY > 50 ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white'}`}>Pekanbaru</span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {['Beranda', 'Tentang', 'Fitur', 'Cara Kerja', 'FAQ'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item === 'Beranda' ? 'hero' : item.toLowerCase().replace(' ', '-'))}
                  className={`text-sm font-medium transition-colors ${scrollY > 50 ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white'}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${scrollY > 50 ? 'text-primary border border-primary/30 hover:bg-primary/5' : 'text-white border border-white/30 hover:bg-white/10'}`}
              >
                Masuk
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                Daftar
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${scrollY > 50 ? 'text-slate-600' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="bg-white border-t border-slate-100 px-4 py-4 space-y-2">
            {['Beranda', 'Tentang', 'Fitur', 'Cara Kerja', 'FAQ'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item === 'Beranda' ? 'hero' : item.toLowerCase().replace(' ', '-'))}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
              >
                {item}
              </button>
            ))}
            <hr className="border-slate-100 my-2" />
            <button
              onClick={() => navigate('/login')}
              className="block w-full px-4 py-2.5 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/register')}
              className="block w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              Daftar
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" style={heroStyle} className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={container}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Activity className="w-4 h-4 text-emerald-300" />
                <span className="text-sm text-white/90">Platform Smart City Pekanbaru</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Laporkan Kerusakan Jalan.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  Kami Tindak Lanjuti.
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-8">
                Platform pelaporan dan monitoring perbaikan jalan untuk Kota Pekanbaru.
                Warga melapor, Dinas PUPR merespons cepat dan transparan.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/register')}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/30"
                >
                  Buat Laporan Sekarang
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scrollTo('tentang')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-base border border-white/20 hover:bg-white/20 transition-all"
                >
                  Pelajari Selengkapnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                      {['RH', 'SN', 'AF', 'DW'][i - 1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/60">Digunakan oleh 1.000+ warga Pekanbaru</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-white/10 backdrop-blur-sm p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/5" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Laporan Ditutup</p>
                        <p className="text-white/60 text-sm">JKP-2026-000001 • 2 hari lalu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Sedang Dalam Perbaikan</p>
                        <p className="text-white/60 text-sm">JKP-2026-000002 • Progress 50%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Menunggu Verifikasi</p>
                        <p className="text-white/60 text-sm">JKP-2026-000003 • Baru masuk</p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-sm">Progress Keseluruhan</span>
                        <span className="text-emerald-400 text-sm font-semibold">75%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* TENTANG SECTION */}
      <section id="tentang" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={container}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
                <Route className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Tentang JalanKita</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Platform Digital untuk{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Infrastruktur Kota</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-6">
                JalanKita Pekanbaru adalah inisiatif Smart City dari Dinas Pekerjaan Umum dan Penataan Ruang (PUPR)
                Kota Pekanbaru untuk mempermudah warga dalam melaporkan kerusakan jalan dan infrastruktur publik.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-slate-500 mb-8">
                Dengan sistem terintegrasi antara warga, admin, koordinator lapangan, dan teknisi, setiap laporan
                ditangani secara cepat, transparan, dan akuntabel. Bersama kita wujudkan Pekanbaru yang lebih baik.
              </motion.p>
              <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-slate-500">Kecamatan & Kelurahan</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-slate-500">Gratis untuk Warga</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-slate-500">Lapor Kapan Saja</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-slate-200 overflow-hidden p-8">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-secondary p-8 flex flex-col items-center justify-center text-white text-center">
                  <MapPinned className="w-16 h-16 mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">Kota Pekanbaru</h3>
                  <p className="text-white/80">Ibukota Provinsi Riau</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl font-bold">983</p>
                      <p className="text-xs text-white/70">KM Jalan Kota</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-2xl font-bold">15</p>
                      <p className="text-xs text-white/70">Kecamatan</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section id="fitur" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Fitur Unggulan</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Semua yang Anda Butuhkan
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Platform lengkap untuk pelaporan, monitoring, dan penanganan kerusakan jalan di Pekanbaru.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={i}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CARA KERJA SECTION */}
      <section id="cara-kerja" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Cara Kerja</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Bagaimana Cara Melapor?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Proses pelaporan hingga perbaikan jalan yang transparan dan mudah diikuti.
            </motion.p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20" />

            <div className="space-y-8 lg:space-y-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`lg:flex items-center gap-8 ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'} ${i > 0 ? 'lg:mt-8' : ''}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all ${i % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'}`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {step.num}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-slate-500 text-sm ml-14">{step.desc}</p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-sm z-10 shadow-lg flex-shrink-0">
                    <step.icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK SECTION */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F4C81 50%, #1A6BA8 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-medium text-white/90">Statistik</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Dampak JalanKita Pekanbaru
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/70 max-w-2xl mx-auto">
              Data real-time penanganan kerusakan jalan di Kota Pekanbaru.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { value: '1.247', label: 'Laporan Diproses', icon: FileText },
              { value: '892', label: 'Perbaikan Selesai', icon: CheckCircle },
              { value: '98.5%', label: 'Kepuasan Warga', icon: Star },
              { value: '48 Jam', label: 'Rata-rata Respons', icon: Clock },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                custom={i}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONI SECTION */}
      <section id="testimoni" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Testimoni</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Apa Kata Warga?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
              Pengalaman warga Pekanbaru menggunakan JalanKita.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                custom={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">FAQ</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pertanyaan Umum
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500">
              Jawaban untuk pertanyaan yang sering diajukan.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-slate-900 text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFaq === i ? 'max-h-48' : 'max-h-0'}`}>
                  <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 lg:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F4C81 50%, #1A6BA8 100%)' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={container}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Siap untuk Melaporkan?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan warga Pekanbaru yang sudah menggunakan JalanKita.
              Bersama kita wujudkan infrastruktur kota yang lebih baik.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary font-semibold text-base hover:bg-white/90 transition-all shadow-xl"
              >
                Daftar Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-base border border-white/20 hover:bg-white/20 transition-all"
              >
                Masuk ke Akun
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">JalanKita</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Platform pelaporan dan monitoring perbaikan jalan untuk Kota Pekanbaru.
              </p>
              <div className="flex gap-3">
                {[Globe, Globe, Globe, Globe].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Fitur</h4>
              <ul className="space-y-2.5">
                {['Buat Laporan', 'Tracking Laporan', 'Dashboard', 'Notifikasi', 'Riwayat Laporan'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-slate-400 hover:text-white transition-colors">{item}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Perusahaan</h4>
              <ul className="space-y-2.5">
                {['Tentang Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Karir', 'Kontak'].map((item) => (
                  <li key={item}>
                    <button className="text-sm text-slate-400 hover:text-white transition-colors">{item}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Kontak</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-400">Dinas PUPR Kota Pekanbaru<br />Jl. Badak No. 25, Pekanbaru</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-400">(0761) 12345</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-400">pupr@pekanbaru.go.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} JalanKita Pekanbaru. Dikelola oleh Dinas PUPR Kota Pekanbaru.
            </p>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <span>Dibangun dengan</span>
              <span className="text-red-500">&hearts;</span>
              <span>untuk Pekanbaru</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
