# Deploy ke Vercel

## Prasyarat
- Projek sudah di-push ke GitHub
- Akun Vercel (daftar di https://vercel.com - login pakai GitHub)

## Cara 1: Deploy via Vercel Dashboard (Termudah)

1. Buka https://vercel.com dan login dengan GitHub
2. Klik **Add New** → **Project**
3. Pilih repository `muhammadrifaii/Pelaporan_kerusakanjalan`
4. **Framework Preset** akan otomatis terdeteksi sebagai **Vite**
5. Scroll ke **Environment Variables**, tambahkan:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   (Isi sesuai `.env.local` kamu)
6. Klik **Deploy**
7. Selesai! Aplikasi akan hidup di `https://pelaporan-kerusakanjalan.vercel.app`

## Cara 2: Deploy via CLI (Terminal)

```bash
# Install Vercel CLI (sekali saja)
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy dari folder projek
vercel --prod
```

Vercel akan otomatis mendeteksi Vite + React. Saat diminta:
- **Set up and deploy**: Y
- **Which scope**: pilih akun kamu
- **Link to existing project**: N
- **Project name**: `pelaporan-kerusakanjalan`
- **Directory**: `./`
- **Override settings**: N

## Environment Variables di Vercel

Environment variable bisa diatur di:
- **Vercel Dashboard** → Project → Settings → Environment Variables
- Atau via CLI: `vercel env add VITE_SUPABASE_URL`

## SPA Routing (React Router)

File `vercel.json` sudah otomatis dibuat di projek ini agar React Router berfungsi:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Update setelah deploy

Setiap kali push ke branch `main`, Vercel akan auto-deploy ulang.

## Domain Kustom (opsional)

1. Vercel Dashboard → Project → Settings → Domains
2. Masukkan domain kamu
3. Ikuti petunjuk konfigurasi DNS

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Blank page | Cek Environment Variables di Vercel Dashboard |
| 404 saat refresh | Pastikan `vercel.json` ada dengan rewrite rules |
| Build error | Jalankan `npm run build` dulu di lokal untuk test |
