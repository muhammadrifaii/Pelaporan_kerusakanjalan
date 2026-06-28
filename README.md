# JalanKita Pekanbaru

Platform pelaporan kondisi jalan yang memungkinkan masyarakat melaporkan kerusakan jalan secara langsung dengan bantuan peta interaktif, foto, dan lokasi GPS. Laporan akan diverifikasi oleh Administrator Dinas PUPR, diteruskan kepada Koordinator Lapangan, kemudian ditugaskan kepada Petugas Lapangan (Teknisi) untuk dilakukan survei dan perbaikan.

## 🎯 Fitur Utama

### 👤 Masyarakat (Pelapor)
- Registrasi dan login
- Edit profil dan upload foto profil
- Membuat laporan kondisi jalan dengan foto dan GPS
- Melihat riwayat laporan dan tracking progress
- Rating dan komentar setelah pekerjaan selesai
- Notifikasi realtime perubahan status

### 🛡️ Administrator Dinas PUPR
- Verifikasi laporan dan penolakan dengan alasan
- Manajemen user (Admin, Koordinator, Teknisi)
- Dashboard statistik dan analitik
- CRUD untuk kecamatan, kelurahan, kategori kerusakan
- Penugasan laporan ke Koordinator Lapangan

### 👨‍💼 Koordinator Lapangan
- Melihat daftar laporan yang masuk
- Menentukan dan membagi pekerjaan ke Teknisi
- Monitoring progress melalui Maps
- Mengatur jadwal dan prioritas
- Memberikan instruksi ke Teknisi

### 👷 Petugas Lapangan / Teknisi
- Dashboard tugas harian
- Navigasi menuju lokasi perbaikan
- Upload foto sebelum, saat, dan setelah perbaikan
- Update progress pekerjaan (0%, 10%, 25%, 50%, 75%, 100%)
- Tambah catatan dan tanda tangan pekerjaan selesai

## 🏗️ Struktur Project

```
src/
├── components/          # Komponen React
│   ├── common/         # Komponen umum (Button, Card, Toast, dll)
│   ├── dashboard/      # Komponen dashboard
│   └── map/            # Komponen maps
├── pages/              # Halaman-halaman aplikasi
├── layouts/            # Layout global
├── context/            # Context API (Auth, Toast)
├── hooks/              # Custom hooks
├── api/                # API services
├── services/           # Business logic
├── utils/              # Utility functions
├── lib/                # Library setup (Supabase)
├── types/              # TypeScript types
├── middleware/         # Middleware (Protected routes)
└── assets/             # Static assets
```

## 🚀 Teknologi yang Digunakan

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animasi
- **React Hook Form** - Form handling
- **Leaflet** - Maps
- **Recharts** - Charts

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Realtime
  - Row Level Security (RLS)

## 📋 Workflow Status

1. **Laporan Berhasil Dikirim** - User membuat laporan
2. **Menunggu Verifikasi Admin** - Admin memeriksa data
3. **Laporan Diterima** / **Ditolak** - Hasil verifikasi
4. **Menunggu Penugasan Teknisi** - Koordinator menunggu penugasan
5. **Teknisi Ditugaskan** - Teknisi sudah ditunjuk
6. **Survei Lapangan** - Teknisi menuju lokasi
7. **Sedang Dalam Perbaikan** - Perbaikan berlangsung
8. **Menunggu Verifikasi Akhir** - Admin verifikasi hasil
9. **Perbaikan Selesai** - Pekerjaan selesai
10. **Laporan Ditutup** - User beri rating & komentar

## 🎨 Design System

### Warna
- **Primary**: #0F4C81 (Biru gelap)
- **Secondary**: #1D9BF0 (Biru cerah)
- **Success**: #22C55E (Hijau)
- **Warning**: #F59E0B (Orange)
- **Danger**: #EF4444 (Merah)
- **Background**: #F8FAFC (Putih)

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ dan npm
- Supabase account
- Environment variables setup

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd jalankita-pekanbaru
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup Supabase**
   - Ikuti panduan di [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)
   - Copy `.env.example` ke `.env.local`
   - Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Build untuk production**
   ```bash
   npm run build
   ```

## 📝 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🔐 Authentication

Aplikasi menggunakan Supabase Authentication dengan JWT tokens.

- **Registrasi**: Hanya Masyarakat yang dapat self-register
- **Roles**: citizen, admin, coordinator, technician
- **Session**: Disimpan di browser, sinkronisasi realtime
- **RLS**: Row Level Security untuk keamanan data

## 📊 Database Schema

- **users** - User profiles dengan role
- **reports** - Data laporan kerusakan jalan
- **status_history** - Timeline perubahan status laporan
- **notifications** - Notifikasi untuk users
- **audit_logs** - Log audit untuk tracking
- **districts** - Data kecamatan Pekanbaru
- **subdistricts** - Data kelurahan

## 🗺️ Maps Integration

- **Provider**: Leaflet + OpenStreetMap
- **Features**:
  - Klik lokasi pada map
  - Marker draggable
  - Ambil GPS otomatis
  - Reverse geocoding
  - Fullscreen map
  - Current location
  - Marker clustering

## 📚 Dokumentasi Lebih Lanjut

- [Supabase Setup](./SETUP_SUPABASE.md)

## 📄 License

MIT License - Proyek Akademik
```
