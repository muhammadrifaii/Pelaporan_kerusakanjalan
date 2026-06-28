# Setup Supabase

## 1. Membuat Project Supabase

1. Pergi ke [supabase.com](https://supabase.com)
2. Klik "Sign Up" atau "Log In"
3. Klik "New Project"
4. Isi nama project, password database, dan region
5. Tunggu project selesai dibuat

## 2. Konfigurasi Environment Variables

1. Buka Supabase Dashboard
2. Klik "Settings" → "API"
3. Copy nilai dari:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon (public) key** → `VITE_SUPABASE_ANON_KEY`
4. Buat file `.env.local` di root project:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 3. Setup Database Tables

Buka SQL Editor di Supabase Dashboard dan jalankan script berikut:

### a. Create Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'admin', 'coordinator', 'technician')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### b. Create Reports Table
```sql
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  citizen_id UUID NOT NULL REFERENCES users(id),
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT NOT NULL,
  citizen_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Ringan', 'Sedang', 'Berat')),
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  subdistrict TEXT NOT NULL,
  street_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  images_before TEXT[] DEFAULT '{}',
  images_progress TEXT[] DEFAULT '{}',
  images_after TEXT[] DEFAULT '{}',
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'Laporan Berhasil Dikirim',
  progress INTEGER DEFAULT 0 CHECK (progress IN (0, 10, 25, 50, 75, 100)),
  priority TEXT,
  admin_notes TEXT,
  rejection_reason TEXT,
  coordinator_id UUID REFERENCES users(id),
  technician_id UUID REFERENCES users(id),
  technician_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  citizen_comment TEXT
);

-- Create indexes
CREATE INDEX idx_reports_citizen_id ON reports(citizen_id);
CREATE INDEX idx_reports_coordinator_id ON reports(coordinator_id);
CREATE INDEX idx_reports_technician_id ON reports(technician_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_ticket_number ON reports(ticket_number);
```

### c. Create Status History Table
```sql
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  updated_by_id UUID NOT NULL REFERENCES users(id),
  updated_by_name TEXT NOT NULL,
  updated_by_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_status_history_report_id ON status_history(report_id);
CREATE INDEX idx_status_history_created_at ON status_history(created_at);
```

### d. Create Notifications Table
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### e. Create Audit Logs Table
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### f. Create Districts Table
```sql
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- Insert Pekanbaru Districts
INSERT INTO districts (name) VALUES 
  ('Marpoyan Damai'),
  ('Sail'),
  ('Tenayan Raya'),
  ('Tampan'),
  ('Rumbai'),
  ('Rumbai Pesisir'),
  ('Payung Sekaki'),
  ('Bukit Raya'),
  ('Pekanbaru Kota'),
  ('Senapelan'),
  ('Lima Puluh'),
  ('Sukajadi');
```

### g. Create Subdistricts Table
```sql
CREATE TABLE IF NOT EXISTS subdistricts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id),
  name TEXT NOT NULL,
  UNIQUE(district_id, name)
);

-- Insert Subdistricts for Marpoyan Damai
INSERT INTO subdistricts (district_id, name) VALUES
  ((SELECT id FROM districts WHERE name = 'Marpoyan Damai'), 'Labuh Baru Utara'),
  ((SELECT id FROM districts WHERE name = 'Marpoyan Damai'), 'Labuh Baru Timur'),
  ((SELECT id FROM districts WHERE name = 'Marpoyan Damai'), 'Labuh Baru Barat'),
  ((SELECT id FROM districts WHERE name = 'Marpoyan Damai'), 'Labuh Baru Selatan'),
  ((SELECT id FROM districts WHERE name = 'Marpoyan Damai'), 'Arengka'),
  ((SELECT id FROM districts WHERE name = 'Marpoyan Damai'), 'Arengka 1');
```

## 4. Setup Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and citizens can view all admin profiles
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Citizens can insert their own reports
CREATE POLICY "Citizens can insert reports" ON reports
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'citizen' 
    AND citizen_id = auth.uid()
  );

-- Citizens can view their own reports
CREATE POLICY "Citizens can view their own reports" ON reports
  FOR SELECT USING (
    citizen_id = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'coordinator', 'technician')
  );

-- Admin can update all reports
CREATE POLICY "Admin can update reports" ON reports
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Everyone can view their notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Everyone can update their notifications
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

## 5. Setup Storage Buckets

Di Supabase Dashboard:

1. Klik "Storage" di sidebar
2. Buat bucket baru dengan nama:
   - `avatars` - untuk foto profil
   - `report-images` - untuk foto laporan
   - `report-videos` - untuk video laporan
   - `technician-progress` - untuk dokumentasi progres teknisi

3. Untuk setiap bucket, set visibility menjadi "Public"

## 6. Setup Authentication

1. Di Supabase Dashboard, klik "Auth" → "Providers"
2. Pastikan "Email" sudah enabled
3. Klik "Email" dan sesuaikan konfigurasi:
   - Enable email confirmations (optional)
   - Set email templates jika diperlukan

## Selesai!

Sekarang aplikasi siap dijalankan dengan:
```bash
npm install
npm run dev
```
