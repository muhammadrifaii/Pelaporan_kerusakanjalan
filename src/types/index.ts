export type UserRole = 'citizen' | 'admin' | 'coordinator' | 'technician';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string;
  address?: string;
  avatar_url?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export type DamageCategory =
  | 'Jalan Berlubang'
  | 'Jalan Retak'
  | 'Jalan Ambles'
  | 'Aspal Rusak'
  | 'Drainase Rusak'
  | 'Genangan'
  | 'Marka Jalan Rusak'
  | 'Jembatan Rusak'
  | 'Lainnya';

export type SeverityLevel = 'Ringan' | 'Sedang' | 'Berat';

export type ReportStatus =
  | 'Laporan Berhasil Dikirim'
  | 'Menunggu Verifikasi Admin'
  | 'Laporan Diterima'
  | 'Menunggu Penugasan Teknisi'
  | 'Teknisi Ditugaskan'
  | 'Survei Lapangan'
  | 'Sedang Dalam Perbaikan'
  | 'Menunggu Verifikasi Akhir'
  | 'Perbaikan Selesai'
  | 'Laporan Ditutup'
  | 'Ditolak';

export type PriorityLevel = 'Rendah' | 'Sedang' | 'Tinggi';

export interface Report {
  id: string;
  ticket_number: string;
  citizen_id: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string;
  title: string;
  description: string;
  category: DamageCategory;
  severity: SeverityLevel;
  city: string;
  district: string; // Kecamatan
  subdistrict: string; // Kelurahan
  street_name: string;
  latitude: number;
  longitude: number;
  images_before: string[];
  images_progress: string[];
  images_after: string[];
  video_url?: string | null;
  status: ReportStatus;
  progress: number; // 0, 10, 25, 50, 75, 100
  priority?: PriorityLevel | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  coordinator_id?: string | null;
  technician_id?: string | null;
  technician_notes?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  rating?: number | null;
  citizen_comment?: string | null;
}

export interface StatusHistory {
  id: string;
  report_id: string;
  status: ReportStatus;
  notes?: string | null;
  updated_by_name: string;
  updated_by_role: UserRole;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  report_id: string;
  ticket_number: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  details: string;
  created_at: string;
}

export interface District {
  id: string;
  name: string;
}

export interface Subdistrict {
  id: string;
  district_id: string;
  name: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  onClose: (id: string) => void;
  autoClose?: boolean;
}
