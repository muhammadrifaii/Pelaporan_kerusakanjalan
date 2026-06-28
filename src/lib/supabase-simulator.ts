import type {
  User, Report, StatusHistory, Notification, AuditLog, 
  UserRole, DamageCategory, SeverityLevel, ReportStatus, PriorityLevel, District, Subdistrict 
} from '../types';

// ====================================================================
// STATIC REGISTRATION DATA (KOTA PEKANBARU)
// ====================================================================

export const PECANBARU_DISTRICTS: District[] = [
  { id: 'd1', name: 'Bina Widya' },
  { id: 'd2', name: 'Tuah Madani' },
  { id: 'd3', name: 'Bukit Raya' },
  { id: 'd4', name: 'Marpoyan Damai' },
  { id: 'd5', name: 'Tenayan Raya' },
  { id: 'd6', name: 'Senapelan' },
  { id: 'd7', name: 'Payung Sekaki' },
  { id: 'd8', name: 'Rumbai' }
];

export const PECANBARU_SUBDISTRICTS: Subdistrict[] = [
  // Bina Widya
  { id: 's1', district_id: 'd1', name: 'Simpang Baru' },
  { id: 's2', district_id: 'd1', name: 'Delima' },
  { id: 's3', district_id: 'd1', name: 'Tobek Godang' },
  { id: 's4', district_id: 'd1', name: 'Sungai Sibam' },
  // Tuah Madani
  { id: 's5', district_id: 'd2', name: 'Sidomulyo Barat' },
  { id: 's6', district_id: 'd2', name: 'Tuah Karya' },
  { id: 's7', district_id: 'd2', name: 'Tuah Madani' },
  { id: 's8', district_id: 'd2', name: 'Sialang Munggu' },
  // Bukit Raya
  { id: 's9', district_id: 'd3', name: 'Simpang Tiga' },
  { id: 's10', district_id: 'd3', name: 'Tangkerang Selatan' },
  { id: 's11', district_id: 'd3', name: 'Tangkerang Utara' },
  { id: 's12', district_id: 'd3', name: 'Tangkerang Labuai' },
  // Marpoyan Damai
  { id: 's13', district_id: 'd4', name: 'Sidomulyo Timur' },
  { id: 's14', district_id: 'd4', name: 'Maharatu' },
  { id: 's15', district_id: 'd4', name: 'Tangkerang Tengah' },
  { id: 's16', district_id: 'd4', name: 'Tangkerang Barat' },
  // Tenayan Raya
  { id: 's17', district_id: 'd5', name: 'Rejosari' },
  { id: 's18', district_id: 'd5', name: 'Tangkerang Timur' },
  { id: 's19', district_id: 'd5', name: 'Bambu Kuning' },
  // Senapelan
  { id: 's20', district_id: 'd6', name: 'Kampung Bandar' },
  { id: 's21', district_id: 'd6', name: 'Padang Terubuk' },
  { id: 's22', district_id: 'd6', name: 'Sago' }
];

export const DAMAGE_CATEGORIES: DamageCategory[] = [
  'Jalan Berlubang',
  'Jalan Retak',
  'Jalan Ambles',
  'Aspal Rusak',
  'Drainase Rusak',
  'Genangan',
  'Marka Jalan Rusak',
  'Jembatan Rusak',
  'Lainnya'
];

// ====================================================================
// INITIAL MOCK DATA
// ====================================================================

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    email: 'admin.dinas@pupr.pekanbaru.go.id',
    role: 'admin',
    full_name: 'Deni Hermawan, S.T. (Admin Dinas PUPR)',
    phone: '081234567890',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    active: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString()
  },
  {
    id: 'u-coordinator',
    email: 'budi.coordinator@pupr.pekanbaru.go.id',
    role: 'coordinator',
    full_name: 'Budi Santoso (Koordinator Lapangan)',
    phone: '082176543210',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    active: true,
    created_at: new Date('2026-01-05T00:00:00Z').toISOString()
  },
  {
    id: 'u-technician',
    email: 'edi.teknisi@pupr.pekanbaru.go.id',
    role: 'technician',
    full_name: 'Edi Wibowo (Teknisi Lapangan)',
    phone: '085299887766',
    avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    active: true,
    created_at: new Date('2026-01-10T00:00:00Z').toISOString()
  },
  {
    id: 'u-technician2',
    email: 'ilham.teknisi@pupr.pekanbaru.go.id',
    role: 'technician',
    full_name: 'Ilham Hidayat (Teknisi Lapangan)',
    phone: '085377889900',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    active: true,
    created_at: new Date('2026-01-12T00:00:00Z').toISOString()
  },
  {
    id: 'u-citizen',
    email: 'rudi.warga@gmail.com',
    role: 'citizen',
    full_name: 'Rudi Hermawan',
    phone: '081377665544',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    active: true,
    created_at: new Date('2026-05-01T00:00:00Z').toISOString()
  }
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-001',
    ticket_number: 'JKP-2026-000001',
    citizen_id: 'u-citizen',
    citizen_name: 'Rudi Hermawan',
    citizen_phone: '081377665544',
    citizen_email: 'rudi.warga@gmail.com',
    title: 'Lubang besar membahayakan di Jl. H.R. Soebrantas',
    description: 'Lubang sedalam 20cm di lajur kiri dekat halte Trans Metro Pekanbaru depan Panam Square. Sangat membahayakan pengendara motor terutama di malam hari karena kurang penerangan.',
    category: 'Jalan Berlubang',
    severity: 'Berat',
    city: 'Pekanbaru',
    district: 'Tuah Madani',
    subdistrict: 'Tuah Karya',
    street_name: 'Jl. H.R. Soebrantas, depan Panam Square',
    latitude: 0.4652,
    longitude: 101.3912,
    images_before: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600'],
    images_progress: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600'],
    images_after: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600'],
    status: 'Selesai',
    progress: 100,
    priority: 'Tinggi',
    admin_notes: 'Laporan valid, tingkat kerusakan berat di jalan arteri kota. Prioritas tinggi.',
    technician_id: 'u-technician',
    coordinator_id: 'u-coordinator',
    technician_notes: 'Kerusakan jalan berlubang sudah ditambal dengan aspal hotmix tipe AC-WC. Drainase samping jalan dibersihkan sedikit agar air tidak menggenang.',
    rating: 5,
    citizen_comment: 'Perbaikan sangat cepat, rapi, dan responsif. Terima kasih Dinas PUPR Pekanbaru!',
    created_at: new Date('2026-06-10T08:10:00Z').toISOString(),
    updated_at: new Date('2026-06-11T16:00:00Z').toISOString(),
    completed_at: new Date('2026-06-11T15:30:00Z').toISOString()
  },
  {
    id: 'rep-002',
    ticket_number: 'JKP-2026-000002',
    citizen_id: 'u-citizen',
    citizen_name: 'Rudi Hermawan',
    citizen_phone: '081377665544',
    citizen_email: 'rudi.warga@gmail.com',
    title: 'Aspal Ambles dekat Flyover Nangka',
    description: 'Permukaan aspal ambles di lajur tengah Jl. Jenderal Sudirman dekat flyover persimpangan Jl. Tuanku Tambusai (Nangka), persis di depan Gramedia. Menyebabkan kemacetan karena mobil harus mengerem mendadak.',
    category: 'Jalan Ambles',
    severity: 'Sedang',
    city: 'Pekanbaru',
    district: 'Bukit Raya',
    subdistrict: 'Tangkerang Selatan',
    street_name: 'Jl. Jenderal Sudirman, depan Gramedia',
    latitude: 0.4983,
    longitude: 101.4485,
    images_before: ['https://images.unsplash.com/photo-1599740831114-1740a1863ffd?w=600'],
    images_progress: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600'],
    images_after: [],
    status: 'Sedang Diproses',
    progress: 50,
    priority: 'Sedang',
    admin_notes: 'Laporan diverifikasi, lokasi dekat persimpangan padat. Diteruskan ke Koordinator Lapangan.',
    technician_id: 'u-technician',
    coordinator_id: 'u-coordinator',
    technician_notes: 'Proses pemadatan dasar jalan dengan agregat kelas A sebelum pelapisan aspal baru.',
    created_at: new Date('2026-06-12T09:20:00Z').toISOString(),
    updated_at: new Date('2026-06-14T14:45:00Z').toISOString()
  },
  {
    id: 'rep-003',
    ticket_number: 'JKP-2026-000003',
    citizen_id: 'u-citizen',
    citizen_name: 'Rudi Hermawan',
    citizen_phone: '081377665544',
    citizen_email: 'rudi.warga@gmail.com',
    title: 'Drainase Pecah & Genangan Air di Jl. Arifin Ahmad',
    description: 'Tembok drainase pecah dan tersumbat sedimen tebal. Setiap hujan lebat air langsung meluap ke jalan setinggi 20-30cm dan merusak bahu jalan.',
    category: 'Drainase Rusak',
    severity: 'Sedang',
    city: 'Pekanbaru',
    district: 'Marpoyan Damai',
    subdistrict: 'Tangkerang Barat',
    street_name: 'Jl. Arifin Ahmad, dekat SPBU',
    latitude: 0.4721,
    longitude: 101.4241,
    images_before: ['https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=600'],
    images_progress: [],
    images_after: [],
    status: 'Menunggu Verifikasi Admin',
    progress: 0,
    created_at: new Date('2026-06-15T08:00:00Z').toISOString(),
    updated_at: new Date('2026-06-15T08:22:00Z').toISOString()
  },
  {
    id: 'rep-004',
    ticket_number: 'JKP-2026-000004',
    citizen_id: 'u-citizen',
    citizen_name: 'Rudi Hermawan',
    citizen_phone: '081377665544',
    citizen_email: 'rudi.warga@gmail.com',
    title: 'Retak Kulit Buaya di Jl. Riau',
    description: 'Kerusakan jalan berupa retak kulit buaya (alligator cracking) yang cukup luas di simpang Jl. Riau - Jl. Ahmad Yani. Berbahaya saat licin sehabis hujan.',
    category: 'Jalan Retak',
    severity: 'Ringan',
    city: 'Pekanbaru',
    district: 'Senapelan',
    subdistrict: 'Padang Terubuk',
    street_name: 'Jl. Riau, dekat simpang Jl. Ahmad Yani',
    latitude: 0.5312,
    longitude: 101.4332,
    images_before: ['https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600'],
    images_progress: [],
    images_after: [],
    status: 'Menunggu Verifikasi Admin',
    progress: 0,
    created_at: new Date('2026-06-15T22:30:00Z').toISOString(),
    updated_at: new Date('2026-06-15T22:30:00Z').toISOString()
  }
];

const INITIAL_STATUS_HISTORY: StatusHistory[] = [
  // rep-001
  {
    id: 'h-001',
    report_id: 'rep-001',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Laporan berhasil disubmit oleh masyarakat.',
    updated_by_name: 'Rudi Hermawan',
    updated_by_role: 'citizen',
    created_at: new Date('2026-06-10T08:10:00Z').toISOString()
  },
  {
    id: 'h-002',
    report_id: 'rep-001',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Sistem mengalokasikan laporan ke antrean dinas.',
    updated_by_name: 'Sistem',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-10T08:22:00Z').toISOString()
  },
  {
    id: 'h-003',
    report_id: 'rep-001',
    status: 'Diverifikasi',
    notes: 'Diverifikasi oleh admin, tingkat kerusakan Berat, prioritas Tinggi.',
    updated_by_name: 'Deni Hermawan, S.T.',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-10T09:05:00Z').toISOString()
  },
  {
    id: 'h-004',
    report_id: 'rep-001',
    status: 'Menunggu Penugasan Teknisi',
    notes: 'Laporan diteruskan ke Koordinator Lapangan Budi Santoso.',
    updated_by_name: 'Deni Hermawan, S.T.',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-10T09:40:00Z').toISOString()
  },
  {
    id: 'h-005',
    report_id: 'rep-001',
    status: 'Sedang Diproses',
    notes: 'Koordinator menugaskan Teknisi Edi Wibowo untuk melakukan survei dan perbaikan.',
    updated_by_name: 'Budi Santoso',
    updated_by_role: 'coordinator',
    created_at: new Date('2026-06-10T10:15:00Z').toISOString()
  },
  {
    id: 'h-006',
    report_id: 'rep-001',
    status: 'Sedang Diproses',
    notes: 'Teknisi tiba di lokasi, mengonfirmasi tingkat kerusakan dan mengunggah foto awal.',
    updated_by_name: 'Edi Wibowo',
    updated_by_role: 'technician',
    created_at: new Date('2026-06-10T11:00:00Z').toISOString()
  },
  {
    id: 'h-007',
    report_id: 'rep-001',
    status: 'Sedang Diproses',
    notes: 'Pekerjaan perbaikan jalan dimulai dengan pembersihan area lubang.',
    updated_by_name: 'Edi Wibowo',
    updated_by_role: 'technician',
    created_at: new Date('2026-06-10T12:15:00Z').toISOString()
  },
  {
    id: 'h-008',
    report_id: 'rep-001',
    status: 'Sedang Diproses',
    notes: 'Perbaikan rampung 100%, teknisi mengunggah foto pengerjaan dan foto selesai.',
    updated_by_name: 'Edi Wibowo',
    updated_by_role: 'technician',
    created_at: new Date('2026-06-11T14:45:00Z').toISOString()
  },
  {
    id: 'h-009',
    report_id: 'rep-001',
    status: 'Selesai',
    notes: 'Pekerjaan diperiksa dan disetujui oleh Administrator Dinas PUPR.',
    updated_by_name: 'Deni Hermawan, S.T.',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-11T15:30:00Z').toISOString()
  },
  {
    id: 'h-010',
    report_id: 'rep-001',
    status: 'Selesai',
    notes: 'Pelapor memberikan rating 5 bintang dan komentar kepuasan.',
    updated_by_name: 'Rudi Hermawan',
    updated_by_role: 'citizen',
    created_at: new Date('2026-06-11T16:00:00Z').toISOString()
  },

  // rep-002
  {
    id: 'h-011',
    report_id: 'rep-002',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Laporan dikirim warga.',
    updated_by_name: 'Rudi Hermawan',
    updated_by_role: 'citizen',
    created_at: new Date('2026-06-12T09:20:00Z').toISOString()
  },
  {
    id: 'h-012',
    report_id: 'rep-002',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Masuk antrean verifikasi.',
    updated_by_name: 'Sistem',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-12T09:30:00Z').toISOString()
  },
  {
    id: 'h-013',
    report_id: 'rep-002',
    status: 'Diverifikasi',
    notes: 'Verifikasi sukses, kerusakan Sedang, prioritas Sedang.',
    updated_by_name: 'Deni Hermawan, S.T.',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-12T10:15:00Z').toISOString()
  },
  {
    id: 'h-014',
    report_id: 'rep-002',
    status: 'Menunggu Penugasan Teknisi',
    notes: 'Diteruskan ke Koordinator.',
    updated_by_name: 'Deni Hermawan, S.T.',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-12T10:30:00Z').toISOString()
  },
  {
    id: 'h-015',
    report_id: 'rep-002',
    status: 'Sedang Diproses',
    notes: 'Koordinator menugaskan Teknisi Edi Wibowo.',
    updated_by_name: 'Budi Santoso',
    updated_by_role: 'coordinator',
    created_at: new Date('2026-06-13T08:15:00Z').toISOString()
  },
  {
    id: 'h-016',
    report_id: 'rep-002',
    status: 'Sedang Diproses',
    notes: 'Teknisi tiba di lokasi dan mengunggah foto sebelum perbaikan.',
    updated_by_name: 'Edi Wibowo',
    updated_by_role: 'technician',
    created_at: new Date('2026-06-13T09:00:00Z').toISOString()
  },
  {
    id: 'h-017',
    report_id: 'rep-002',
    status: 'Sedang Diproses',
    notes: 'Pengerjaan dimulai. Progress 50%.',
    updated_by_name: 'Edi Wibowo',
    updated_by_role: 'technician',
    created_at: new Date('2026-06-14T14:45:00Z').toISOString()
  },

  // rep-003
  {
    id: 'h-018',
    report_id: 'rep-003',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Laporan disubmit oleh warga.',
    updated_by_name: 'Rudi Hermawan',
    updated_by_role: 'citizen',
    created_at: new Date('2026-06-15T08:00:00Z').toISOString()
  },
  {
    id: 'h-019',
    report_id: 'rep-003',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Sistem mengalokasikan laporan ke antrean dinas.',
    updated_by_name: 'Sistem',
    updated_by_role: 'admin',
    created_at: new Date('2026-06-15T08:22:00Z').toISOString()
  },

  // rep-004
  {
    id: 'h-020',
    report_id: 'rep-004',
    status: 'Menunggu Verifikasi Admin',
    notes: 'Laporan disubmit oleh warga.',
    updated_by_name: 'Rudi Hermawan',
    updated_by_role: 'citizen',
    created_at: new Date('2026-06-15T22:30:00Z').toISOString()
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    user_id: 'u-citizen',
    title: 'Laporan JKP-2026-000001 Ditutup',
    message: 'Terima kasih atas rating dan komentar yang Anda berikan. Laporan Anda resmi ditutup.',
    report_id: 'rep-001',
    ticket_number: 'JKP-2026-000001',
    read: true,
    created_at: new Date('2026-06-11T16:00:00Z').toISOString()
  },
  {
    id: 'n-002',
    user_id: 'u-citizen',
    title: 'Laporan JKP-2026-000002 Sedang Diperbaiki',
    message: 'Laporan Anda JKP-2026-000002 sedang ditangani oleh teknisi Edi Wibowo di lapangan.',
    report_id: 'rep-002',
    ticket_number: 'JKP-2026-000002',
    read: false,
    created_at: new Date('2026-06-14T14:45:00Z').toISOString()
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'l-001',
    user_id: 'u-admin',
    user_name: 'Deni Hermawan, S.T. (Admin Dinas PUPR)',
    user_role: 'admin',
    action: 'VERIFY_REPORT',
    details: 'Memverifikasi laporan JKP-2026-000001 (Berat, Tinggi)',
    created_at: new Date('2026-06-10T09:05:00Z').toISOString()
  },
  {
    id: 'l-002',
    user_id: 'u-coordinator',
    user_name: 'Budi Santoso (Koordinator Lapangan)',
    user_role: 'coordinator',
    action: 'ASSIGN_TECHNICIAN',
    details: 'Menugaskan teknisi Edi Wibowo ke laporan JKP-2026-000001',
    created_at: new Date('2026-06-10T10:15:00Z').toISOString()
  }
];

// ====================================================================
// SIMULATOR CLASS DEFINITION
// ====================================================================

class SupabaseSimulator {
  private users: User[] = [];
  private reports: Report[] = [];
  private statusHistory: StatusHistory[] = [];
  private notifications: Notification[] = [];
  private auditLogs: AuditLog[] = [];
  
  private activeSession: User | null = null;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  constructor() {
    this.loadData();
  }

  private loadData() {
    const savedUsers = localStorage.getItem('jalankita_users');
    const savedReports = localStorage.getItem('jalankita_reports');
    const savedHistory = localStorage.getItem('jalankita_status_history');
    const savedNotifications = localStorage.getItem('jalankita_notifications');
    const savedLogs = localStorage.getItem('jalankita_audit_logs');
    const savedSession = localStorage.getItem('jalankita_session');

    this.users = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
    this.reports = savedReports ? JSON.parse(savedReports) : INITIAL_REPORTS;
    this.statusHistory = savedHistory ? JSON.parse(savedHistory) : INITIAL_STATUS_HISTORY;
    this.notifications = savedNotifications ? JSON.parse(savedNotifications) : INITIAL_NOTIFICATIONS;
    this.auditLogs = savedLogs ? JSON.parse(savedLogs) : INITIAL_AUDIT_LOGS;
    this.activeSession = savedSession ? JSON.parse(savedSession) : null;

    this.saveData();
  }

  private saveData() {
    localStorage.setItem('jalankita_users', JSON.stringify(this.users));
    localStorage.setItem('jalankita_reports', JSON.stringify(this.reports));
    localStorage.setItem('jalankita_status_history', JSON.stringify(this.statusHistory));
    localStorage.setItem('jalankita_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('jalankita_audit_logs', JSON.stringify(this.auditLogs));
    if (this.activeSession) {
      localStorage.setItem('jalankita_session', JSON.stringify(this.activeSession));
    } else {
      localStorage.removeItem('jalankita_session');
    }
  }

  // Realtime Simulation Emitter
  private notifyListeners(channel: string, event: string, payload: any) {
    const key = `${channel}:${event}`;
    const set = this.listeners.get(key);
    if (set) {
      set.forEach(listener => listener(payload));
    }
    const wildcardSet = this.listeners.get(`${channel}:*`);
    if (wildcardSet) {
      wildcardSet.forEach(listener => listener({ event, payload }));
    }
  }

  public subscribe(channel: string, event: string, callback: (payload: any) => void) {
    const key = `${channel}:${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // ====================================================================
  // AUTHENTICATION SIMULATION
  // ====================================================================

  public async signIn(email: string, _password: string): Promise<{ data: { user: User | null }; error: Error | null }> {
    // Basic Simulation: password validation is simplified
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { data: { user: null }, error: new Error('Email atau password salah.') };
    }
    if (!user.active) {
      return { data: { user: null }, error: new Error('Akun Anda dinonaktifkan. Silakan hubungi Administrator.') };
    }
    
    // Quick Demo helper: check passwords (simple format: NameRole2026! or AdminPUPR2026!)
    // For general testing, we allow any password matching our standard demo accounts
    this.activeSession = user;
    this.saveData();
    this.addAuditLog(user.id, user.full_name, user.role, 'LOGIN', `User ${user.email} berhasil masuk ke sistem.`);
    return { data: { user }, error: null };
  }

  public async signUp(email: string, fullName: string, phone: string): Promise<{ data: { user: User | null }; error: Error | null }> {
    const exists = this.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { data: { user: null }, error: new Error('Email sudah terdaftar.') };
    }

    const newUser: User = {
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      role: 'citizen', // Citizen is the only role that can self-register
      full_name: fullName,
      phone: phone,
      active: true,
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveData();
    this.addAuditLog(newUser.id, newUser.full_name, newUser.role, 'REGISTER', `User ${newUser.email} terdaftar sebagai Masyarakat.`);
    
    // Auto sign in after sign up for seamless UX
    this.activeSession = newUser;
    this.saveData();

    return { data: { user: newUser }, error: null };
  }

  public async signOut(): Promise<{ error: Error | null }> {
    if (this.activeSession) {
      this.addAuditLog(
        this.activeSession.id, 
        this.activeSession.full_name, 
        this.activeSession.role, 
        'LOGOUT', 
        `User ${this.activeSession.email} keluar.`
      );
    }
    this.activeSession = null;
    this.saveData();
    return { error: null };
  }

  public getSessionUser(): User | null {
    return this.activeSession;
  }

  public updateProfile(fullName: string, phone: string, avatarUrl?: string): { user: User | null; error: Error | null } {
    if (!this.activeSession) return { user: null, error: new Error('User session tidak ditemukan.') };
    const userIndex = this.users.findIndex(u => u.id === this.activeSession!.id);
    if (userIndex === -1) return { user: null, error: new Error('User tidak ditemukan.') };

    const updatedUser = {
      ...this.users[userIndex],
      full_name: fullName,
      phone: phone,
      avatar_url: avatarUrl || this.users[userIndex].avatar_url
    };

    this.users[userIndex] = updatedUser;
    this.activeSession = updatedUser;
    this.saveData();
    
    this.addAuditLog(updatedUser.id, updatedUser.full_name, updatedUser.role, 'UPDATE_PROFILE', 'Memperbarui profil diri.');

    return { user: updatedUser, error: null };
  }

  // ====================================================================
  // DATABASE OPERATIONS SIMULATION
  // ====================================================================

  // Users CRUD (Admin Only)
  public getUsers(): User[] {
    return this.users;
  }

  public createStaffUser(email: string, fullName: string, phone: string, role: UserRole): { user: User | null; error: Error | null } {
    const exists = this.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { user: null, error: new Error('Email sudah digunakan.') };

    const newUser: User = {
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      role: role,
      full_name: fullName,
      phone: phone,
      active: true,
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveData();

    if (this.activeSession) {
      this.addAuditLog(
        this.activeSession.id, 
        this.activeSession.full_name, 
        this.activeSession.role, 
        'CREATE_STAFF_ACCOUNT', 
        `Membuat akun staff baru: ${email} dengan role ${role}.`
      );
    }

    return { user: newUser, error: null };
  }

  public toggleUserActive(userId: string): { success: boolean; error: Error | null } {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: new Error('User tidak ditemukan.') };

    user.active = !user.active;
    this.saveData();

    if (this.activeSession) {
      this.addAuditLog(
        this.activeSession.id, 
        this.activeSession.full_name, 
        this.activeSession.role, 
        user.active ? 'ACTIVATE_ACCOUNT' : 'DEACTIVATE_ACCOUNT', 
        `Mengubah status keaktifan akun ${user.email} menjadi ${user.active ? 'Aktif' : 'Nonaktif'}.`
      );
    }
    return { success: true, error: null };
  }

  public updateUserRole(userId: string, newRole: UserRole): { success: boolean; error: Error | null } {
    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, error: new Error('User tidak ditemukan.') };

    const oldRole = user.role;
    user.role = newRole;
    this.saveData();

    if (this.activeSession) {
      this.addAuditLog(
        this.activeSession.id, 
        this.activeSession.full_name, 
        this.activeSession.role, 
        'CHANGE_ROLE', 
        `Mengubah role akun ${user.email} dari ${oldRole} menjadi ${newRole}.`
      );
    }
    return { success: true, error: null };
  }

  public deleteUser(userId: string): { success: boolean; error: Error | null } {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, error: new Error('User tidak ditemukan.') };

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    this.saveData();

    if (this.activeSession) {
      this.addAuditLog(
        this.activeSession.id, 
        this.activeSession.full_name, 
        this.activeSession.role, 
        'DELETE_ACCOUNT', 
        `Menghapus akun ${deletedUser.email}.`
      );
    }
    return { success: true, error: null };
  }

  // Reports Operations
  public getReports(): Report[] {
    return this.reports;
  }

  public getReportById(id: string): Report | undefined {
    return this.reports.find(r => r.id === id || r.ticket_number === id);
  }

  public createReport(reportData: Omit<Report, 'id' | 'ticket_number' | 'status' | 'progress' | 'created_at' | 'updated_at'>): { report: Report | null; error: Error | null } {
    if (!this.activeSession) return { report: null, error: new Error('Sesi Anda telah berakhir.') };

    // Generate Ticket Number: JKP-2026-00000X
    const year = new Date().getFullYear();
    const count = this.reports.length + 1;
    const ticket_number = `JKP-${year}-${count.toString().padStart(6, '0')}`;

    const newReport: Report = {
      ...reportData,
      id: `rep-${Math.random().toString(36).substr(2, 9)}`,
      ticket_number,
      status: 'Menunggu Verifikasi Admin',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images_before: reportData.images_before || [],
      images_progress: [],
      images_after: []
    };

    this.reports.push(newReport);
    this.saveData();

    // 1. Add Status History
    this.addStatusHistory(newReport.id, 'Menunggu Verifikasi Admin', 'Laporan berhasil disubmit oleh masyarakat.', reportData.citizen_name, 'citizen');

    // 2. Add Auto Status History to Waiting Verification
    const updatedReport = {
      ...newReport,
      status: 'Menunggu Verifikasi Admin' as ReportStatus,
      updated_at: new Date().toISOString()
    };
    
    // Replace in list
    const index = this.reports.findIndex(r => r.id === newReport.id);
    this.reports[index] = updatedReport;
    this.saveData();
    
    this.addStatusHistory(updatedReport.id, 'Menunggu Verifikasi Admin', 'Sistem mengalokasikan laporan ke antrean dinas.', 'Sistem', 'admin');

    // 3. Create Notification for Admin (or global event)
    this.createNotification(
      'u-admin', 
      'Laporan Baru Masuk', 
      `Laporan baru ${ticket_number} di ${updatedReport.street_name} menunggu verifikasi Anda.`, 
      updatedReport.id, 
      ticket_number
    );

    // 4. Create Notification for Citizen
    this.createNotification(
      reportData.citizen_id,
      'Laporan Berhasil Dikirim',
      `Laporan Anda dengan nomor tiket ${ticket_number} telah berhasil dikirim dan menunggu verifikasi.`,
      updatedReport.id,
      ticket_number
    );

    // Trigger Realtime
    this.notifyListeners('reports', 'INSERT', updatedReport);

    return { report: updatedReport, error: null };
  }

  // Admin Verification
  public verifyReport(
    reportId: string, 
    action: 'accept' | 'reject' | 'revise', 
    params: { severity?: SeverityLevel; category?: DamageCategory; priority?: PriorityLevel; notes?: string; reason?: string }
  ): { report: Report | null; error: Error | null } {
    if (!this.activeSession || this.activeSession.role !== 'admin') {
      return { report: null, error: new Error('Akses ditolak. Hanya Administrator yang dapat memverifikasi laporan.') };
    }

    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) return { report: null, error: new Error('Laporan tidak ditemukan.') };

    const report = this.reports[index];
    let newStatus: ReportStatus;
    let historyNotes: string;

    if (action === 'accept') {
      newStatus = 'Diverifikasi';
      report.severity = params.severity || report.severity;
      report.category = params.category || report.category;
      report.priority = params.priority || 'Sedang';
      report.admin_notes = params.notes || '';
      historyNotes = `Laporan diterima admin. Kategori: ${report.category}, Keparahan: ${report.severity}, Prioritas: ${report.priority}. Catatan: ${params.notes || '-'}`;
    } else {
      newStatus = 'Ditolak';
      report.rejection_reason = params.reason || 'Data laporan tidak valid atau duplikat.';
      historyNotes = `Laporan ditolak admin. Alasan: ${report.rejection_reason}`;
    }

    report.status = newStatus;
    report.updated_at = new Date().toISOString();
    this.saveData();

    // Add status history
    this.addStatusHistory(report.id, newStatus, historyNotes, this.activeSession.full_name, 'admin');

    // Add Audit Log
    this.addAuditLog(
      this.activeSession.id, 
      this.activeSession.full_name, 
      this.activeSession.role, 
      action === 'accept' ? 'VERIFY_REPORT_ACCEPT' : 'VERIFY_REPORT_REJECT', 
      `Memproses verifikasi tiket ${report.ticket_number} dengan status: ${newStatus}.`
    );

    // Notifications
    this.createNotification(
      report.citizen_id,
      action === 'accept' ? 'Laporan Anda Diterima' : 'Laporan Anda Ditolak',
      action === 'accept' 
        ? `Laporan ${report.ticket_number} telah diverifikasi oleh PUPR. Menunggu penugasan tim teknisi.` 
        : `Laporan ${report.ticket_number} ditolak. Alasan: ${report.rejection_reason}`,
      report.id,
      report.ticket_number
    );

    // If accepted, auto-transition to "Menunggu Penugasan Teknisi"
    if (action === 'accept') {
      report.status = 'Menunggu Penugasan Teknisi';
      this.saveData();
      
      this.addStatusHistory(
        report.id, 
        'Menunggu Penugasan Teknisi', 
        'Laporan masuk antrean penugasan Koordinator Lapangan.', 
        'Sistem', 
        'admin'
      );

      // Notify Coordinator
      this.createNotification(
        'u-coordinator',
        'Tugas Baru Menunggu Penugasan',
        `Laporan ${report.ticket_number} di ${report.street_name} siap ditugaskan ke teknisi.`,
        report.id,
        report.ticket_number
      );
    }

    this.notifyListeners('reports', 'UPDATE', report);
    return { report, error: null };
  }

  // Coordinator Assignment
  public assignTechnician(reportId: string, technicianId: string, priority?: PriorityLevel): { report: Report | null; error: Error | null } {
    if (!this.activeSession || this.activeSession.role !== 'coordinator') {
      return { report: null, error: new Error('Hanya Koordinator Lapangan yang dapat menugaskan teknisi.') };
    }

    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) return { report: null, error: new Error('Laporan tidak ditemukan.') };

    const technician = this.users.find(u => u.id === technicianId && u.role === 'technician');
    if (!technician) return { report: null, error: new Error('Teknisi tidak valid.') };

    const report = this.reports[index];
    report.status = 'Sedang Diproses';
    report.technician_id = technicianId;
    report.coordinator_id = this.activeSession.id;
    if (priority) report.priority = priority;
    report.updated_at = new Date().toISOString();
    
    this.saveData();

    // Status History
    this.addStatusHistory(
      report.id, 
      'Sedang Diproses', 
      `Koordinator menugaskan Teknisi: ${technician.full_name}.`, 
      this.activeSession.full_name, 
      'coordinator'
    );

    // Audit Log
    this.addAuditLog(
      this.activeSession.id, 
      this.activeSession.full_name, 
      this.activeSession.role, 
      'ASSIGN_TECHNICIAN', 
      `Menugaskan teknisi ${technician.full_name} untuk tiket ${report.ticket_number}.`
    );

    // Notify Technician
    this.createNotification(
      technicianId,
      'Tugas Perbaikan Baru',
      `Anda ditugaskan untuk menangani kerusakan ${report.category} di ${report.street_name} (Tiket: ${report.ticket_number}).`,
      report.id,
      report.ticket_number
    );

    // Notify Citizen
    this.createNotification(
      report.citizen_id,
      'Teknisi Ditugaskan',
      `Teknisi ${technician.full_name} telah ditugaskan untuk memperbaiki jalan pada laporan ${report.ticket_number}.`,
      report.id,
      report.ticket_number
    );

    this.notifyListeners('reports', 'UPDATE', report);
    return { report, error: null };
  }

  // Technician Actions
  public updateReportStatusByTechnician(
    reportId: string, 
    newStatus: 'Sedang Diproses', 
    params: { progress?: number; notes?: string; beforeImages?: string[]; progressImages?: string[]; afterImages?: string[] }
  ): { report: Report | null; error: Error | null } {
    if (!this.activeSession || this.activeSession.role !== 'technician') {
      return { report: null, error: new Error('Akses ditolak. Hanya Teknisi Lapangan yang dapat memproses tugas.') };
    }

    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) return { report: null, error: new Error('Laporan tidak ditemukan.') };

    const report = this.reports[index];
    if (report.technician_id !== this.activeSession.id) {
      return { report: null, error: new Error('Laporan ini tidak ditugaskan kepada Anda.') };
    }

    report.status = newStatus;
    report.updated_at = new Date().toISOString();
    report.progress = params.progress !== undefined ? params.progress : report.progress;

    if (params.beforeImages && params.beforeImages.length > 0) {
      report.images_before = [...report.images_before, ...params.beforeImages];
    }
    if (params.progressImages && params.progressImages.length > 0) {
      report.images_progress = [...report.images_progress, ...params.progressImages];
    }
    if (params.afterImages && params.afterImages.length > 0) {
      report.images_after = [...report.images_after, ...params.afterImages];
    }

    report.technician_notes = params.notes || report.technician_notes || 'Pengerjaan berlangsung.';

    this.saveData();

    // Status History
    this.addStatusHistory(
      report.id, 
      newStatus, 
      `Teknisi update: ${report.technician_notes} (Progress: ${report.progress}%).`, 
      this.activeSession.full_name, 
      'technician'
    );

    // Audit Log
    this.addAuditLog(
      this.activeSession.id, 
      this.activeSession.full_name, 
      this.activeSession.role, 
      'TECHNICIAN_PROGRESS', 
      `Memperbarui status tiket ${report.ticket_number} menjadi ${newStatus} (Progress ${report.progress}%).`
    );

    // Notify Citizen
    const notifTitle = 'Update Perbaikan Jalan';
    const notifMsg = `Laporan Anda ${report.ticket_number} sedang diproses. Progress: ${report.progress}%.`;

    this.createNotification(report.citizen_id, notifTitle, notifMsg, report.id, report.ticket_number);
    this.notifyListeners('reports', 'UPDATE', report);

    return { report, error: null };
  }

  // Admin Final Verification (Job Complete)
  public approveCompletion(reportId: string, approve: boolean, notes?: string): { report: Report | null; error: Error | null } {
    if (!this.activeSession || this.activeSession.role !== 'admin') {
      return { report: null, error: new Error('Hanya Administrator yang dapat memverifikasi penyelesaian perbaikan.') };
    }

    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) return { report: null, error: new Error('Laporan tidak ditemukan.') };

    const report = this.reports[index];
    
    if (approve) {
      report.status = 'Selesai';
      report.completed_at = new Date().toISOString();
      report.admin_notes = notes || 'Hasil pengerjaan dinilai baik dan disetujui.';
      this.saveData();

      // Status History
      this.addStatusHistory(
        report.id, 
        'Selesai', 
        `Pekerjaan disetujui admin: ${report.admin_notes}.`, 
        this.activeSession.full_name, 
        'admin'
      );

      // Audit Log
      this.addAuditLog(
        this.activeSession.id, 
        this.activeSession.full_name, 
        this.activeSession.role, 
        'APPROVE_COMPLETION', 
        `Menyetujui penyelesaian perbaikan untuk tiket ${report.ticket_number}.`
      );

      // Notify Citizen
      this.createNotification(
        report.citizen_id,
        'Perbaikan Selesai! Mohon Berikan Ulasan',
        `Jalan pada laporan ${report.ticket_number} selesai diperbaiki. Silakan berikan ulasan & rating bintang Anda.`,
        report.id,
        report.ticket_number
      );
    } else {
      // Revert status to repair in progress with instructions
      report.status = 'Sedang Diproses';
      report.progress = 75;
      report.admin_notes = notes || 'Hasil pengerjaan kurang rapi, butuh perbaikan tambahan.';
      this.saveData();

      // Status History
      this.addStatusHistory(
        report.id, 
        'Sedang Diproses', 
        `Admin meminta pengerjaan ulang: ${report.admin_notes}. Progress diturunkan ke 75%.`, 
        this.activeSession.full_name, 
        'admin'
      );

      // Notify Tech
      if (report.technician_id) {
        this.createNotification(
          report.technician_id,
          'Revisi Hasil Perbaikan',
          `Hasil perbaikan tiket ${report.ticket_number} butuh revisi. Catatan Admin: ${report.admin_notes}`,
          report.id,
          report.ticket_number
        );
      }
    }

    this.notifyListeners('reports', 'UPDATE', report);
    return { report, error: null };
  }

  // Citizen Rating and Close Report
  public submitFeedback(reportId: string, rating: number, comment: string): { report: Report | null; error: Error | null } {
    if (!this.activeSession || this.activeSession.role !== 'citizen') {
      return { report: null, error: new Error('Hanya pelapor (Masyarakat) yang dapat memberikan ulasan.') };
    }

    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) return { report: null, error: new Error('Laporan tidak ditemukan.') };

    const report = this.reports[index];
    if (report.citizen_id !== this.activeSession.id) {
      return { report: null, error: new Error('Ulasan hanya bisa diisi oleh warga pembuat laporan asli.') };
    }

    report.status = 'Selesai';
    report.rating = rating;
    report.citizen_comment = comment;
    report.updated_at = new Date().toISOString();
    this.saveData();

    // Status History
    this.addStatusHistory(
      report.id, 
      'Selesai', 
      `Masyarakat menutup laporan dengan ulasan bintang ${rating}. Ulasan: "${comment}"`, 
      this.activeSession.full_name, 
      'citizen'
    );

    // Audit Log
    this.addAuditLog(
      this.activeSession.id, 
      this.activeSession.full_name, 
      this.activeSession.role, 
      'SUBMIT_FEEDBACK', 
      `Menutup tiket ${report.ticket_number} dengan rating ${rating}.`
    );

    // Notify Staffs
    const msg = `Masyarakat memberi rating ${rating} bintang pada tiket ${report.ticket_number}. Ulasan: "${comment}"`;
    this.createNotification('u-admin', 'Ulasan Baru Diterima', msg, report.id, report.ticket_number);
    if (report.coordinator_id) {
      this.createNotification(report.coordinator_id, 'Ulasan Pekerjaan Diterima', msg, report.id, report.ticket_number);
    }
    if (report.technician_id) {
      this.createNotification(report.technician_id, 'Ulasan Pekerjaan Diterima', msg, report.id, report.ticket_number);
    }

    this.notifyListeners('reports', 'UPDATE', report);
    return { report, error: null };
  }

  // Helper additions
  private addStatusHistory(reportId: string, status: ReportStatus, notes: string, byName: string, byRole: UserRole) {
    const newHistory: StatusHistory = {
      id: `h-${Math.random().toString(36).substr(2, 9)}`,
      report_id: reportId,
      status,
      notes,
      updated_by_name: byName,
      updated_by_role: byRole,
      created_at: new Date().toISOString()
    };
    this.statusHistory.push(newHistory);
    this.saveData();
    this.notifyListeners('status_history', 'INSERT', newHistory);
  }

  private addAuditLog(userId: string, userName: string, userRole: UserRole, action: string, details: string) {
    const newLog: AuditLog = {
      id: `l-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action,
      details,
      created_at: new Date().toISOString()
    };
    this.auditLogs.push(newLog);
    this.saveData();
  }

  public getStatusHistory(reportId: string): StatusHistory[] {
    return this.statusHistory
      .filter(h => h.report_id === reportId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationRead(notifId: string): { success: boolean } {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      this.saveData();
      return { success: true };
    }
    return { success: false };
  }

  public createNotification(userId: string, title: string, message: string, reportId: string, ticketNumber: string) {
    const newNotif: Notification = {
      id: `n-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      title,
      message,
      report_id: reportId,
      ticket_number: ticketNumber,
      read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.push(newNotif);
    this.saveData();
    this.notifyListeners('notifications', 'INSERT', newNotif);
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Mock Storage Simulation
  public async uploadFile(bucket: string, file: File): Promise<{ publicUrl: string; error: Error | null }> {
    // Return a mock URL using a placeholder / local representation
    // If the file is an image, convert to dataURL, or return a stable mock URL
    let publicUrl = `https://images.unsplash.com/photo-1599740831114-1740a1863ffd?w=600`; // Default placeholder
    
    if (bucket === 'avatars') {
      publicUrl = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150`;
    } else if (bucket === 'technician-progress') {
      publicUrl = `https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600`;
    }
    
    // Attempt to read file as dataURL to show user what they actually uploaded!
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ publicUrl: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ publicUrl, error: null }); // Fallback on error
      };
      reader.readAsDataURL(file);
    });
  }
}

export const simulator = new SupabaseSimulator();
