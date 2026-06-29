-- ====================================================================
-- JALANKITA PEKANBARU - SUPABASE DATABASE SCHEMA
-- ====================================================================

-- 1. Create Custom Types & Enums (Optional, or handled as TEXT with Check constraints)

-- 2. Create Districts & Subdistricts Tables
CREATE TABLE public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE public.subdistricts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE (district_id, name)
);

-- 3. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'admin', 'coordinator', 'technician')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT DEFAULT '',
    avatar_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
    ON public.profiles FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Create Users Table (referenced by reports.citizen_id)
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'admin', 'coordinator', 'technician')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" 
    ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update their own record" 
    ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own record" 
    ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create Reports Table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    citizen_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT NOT NULL,
    citizen_email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Jalan Berlubang', 'Jalan Retak', 'Jalan Ambles', 'Aspal Rusak', 
        'Drainase Rusak', 'Genangan', 'Marka Jalan Rusak', 'Jembatan Rusak', 'Lainnya'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('Ringan', 'Sedang', 'Berat')),
    city TEXT NOT NULL DEFAULT 'Pekanbaru',
    district TEXT NOT NULL,
    subdistrict TEXT NOT NULL,
    street_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    images_before TEXT[] DEFAULT '{}',
    images_progress TEXT[] DEFAULT '{}',
    images_after TEXT[] DEFAULT '{}',
    video_url TEXT,
    status TEXT NOT NULL CHECK (status IN (
        'Menunggu Verifikasi Admin', 'Diverifikasi',
        'Menunggu Penugasan Teknisi', 'Sedang Diproses',
        'Selesai', 'Ditolak'
    )),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    priority TEXT CHECK (priority IN ('Rendah', 'Sedang', 'Tinggi')),
    admin_notes TEXT,
    rejection_reason TEXT,
    coordinator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    technician_notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    citizen_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reports REPLICA IDENTITY FULL;

-- Reports Policies
CREATE POLICY "Reports are viewable by everyone" 
    ON public.reports FOR SELECT USING (true);

CREATE POLICY "Citizens can insert reports" 
    ON public.reports FOR INSERT WITH CHECK (
        auth.uid() = citizen_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'citizen'
        )
    );

CREATE POLICY "Citizens can update their own reports (e.g., rate/comment)" 
    ON public.reports FOR UPDATE USING (
        auth.uid() = citizen_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'citizen'
        )
    );

CREATE POLICY "Citizens can delete their own reports only before admin verification" 
    ON public.reports FOR DELETE USING (
        auth.uid() = citizen_id AND 
        status = 'Laporan Berhasil Dikirim' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'citizen'
        )
    );

CREATE POLICY "Admins can manage all reports" 
    ON public.reports FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Coordinators can view and update reports assigned to them or unassigned" 
    ON public.reports FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'coordinator'
        )
    );

CREATE POLICY "Technicians can view and update reports assigned to them" 
    ON public.reports FOR UPDATE USING (
        technician_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'technician'
        )
    );

-- 6. Create Status History Table
CREATE TABLE public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    updated_by_name TEXT NOT NULL,
    updated_by_role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history REPLICA IDENTITY FULL;

CREATE POLICY "Status history is viewable by everyone" 
    ON public.status_history FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert status history" 
    ON public.status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    ticket_number TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark read)" 
    ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated service role can insert notifications" 
    ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Create Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
    ON public.audit_logs FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can insert audit logs" 
    ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Storage Setup — jalankan SQL ini di Supabase SQL Editor
-- Storage buckets WAJIB dibuat sebelum upload bisa berfungsi:
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('report-videos', 'report-videos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('technician-progress', 'technician-progress', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (opsional, hanya jika bucket tidak public):
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars','report-images','report-videos','technician-progress'));
-- CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Own Delete" ON storage.objects FOR DELETE USING (auth.uid() = owner);

-- Realtime Setup
-- Add tables to the supabase_realtime publication
alter publication supabase_realtime add table public.reports;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.status_history;
