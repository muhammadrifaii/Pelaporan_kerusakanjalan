import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { 
  User, Report, StatusHistory, Notification, AuditLog, 
  UserRole, DamageCategory, SeverityLevel, ReportStatus, PriorityLevel, District, Subdistrict 
} from '../types';
import { isSimulator, supabase } from '../lib/supabase';
import { simulator, PECANBARU_DISTRICTS, PECANBARU_SUBDISTRICTS, DAMAGE_CATEGORIES } from '../lib/supabase-simulator';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  reports: Report[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  isOfflineMode: boolean;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, phone: string, avatarUrl?: string) => Promise<void>;
  
  // Database Actions
  createReport: (reportData: Omit<Report, 'id' | 'ticket_number' | 'status' | 'progress' | 'created_at' | 'updated_at'>) => Promise<Report>;
  verifyReport: (reportId: string, action: 'accept' | 'reject' | 'revise', params: { severity?: SeverityLevel; category?: DamageCategory; priority?: PriorityLevel; notes?: string; reason?: string }) => Promise<Report>;
  assignTechnician: (reportId: string, technicianId: string, priority?: PriorityLevel) => Promise<Report>;
  updateReportStatusByTechnician: (reportId: string, status: 'Survei Lapangan' | 'Sedang Dalam Perbaikan' | 'Menunggu Verifikasi Akhir', params: { progress?: number; notes?: string; beforeImages?: string[]; progressImages?: string[]; afterImages?: string[] }) => Promise<Report>;
  approveCompletion: (reportId: string, approve: boolean, notes?: string) => Promise<Report>;
  submitFeedback: (reportId: string, rating: number, comment: string) => Promise<Report>;
  markNotificationRead: (notifId: string) => Promise<void>;
  getStatusHistory: (reportId: string) => Promise<StatusHistory[]>;
  uploadFile: (bucket: string, file: File) => Promise<string>;
  
  // Admin Management Actions (CRUD)
  getStaffUsers: () => User[];
  createStaffUser: (email: string, fullName: string, phone: string, role: UserRole) => Promise<User>;
  toggleUserActive: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Static Reference Data
  districts: District[];
  subdistricts: Subdistrict[];
  categories: DamageCategory[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const realtimeSubscriptions = useRef<(() => void)[]>([]);

  // Show Toast Toast Notification Helper
  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync state between client and source (real Supabase or local simulator)
  const refreshData = async (user: User | null) => {
    if (!user) {
      setReports([]);
      setNotifications([]);
      setAuditLogs([]);
      return;
    }

    try {
      if (isSimulator) {
        // Fetch from local simulator
        setReports(simulator.getReports());
        setNotifications(simulator.getNotifications(user.id));
        if (user.role === 'admin') {
          setAuditLogs(simulator.getAuditLogs());
        }
      } else {
        // Fetch from real Supabase
        const { data: reportsData } = await supabase!
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data: notifData } = await supabase!
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setReports(reportsData || []);
        setNotifications(notifData || []);

        if (user.role === 'admin') {
          const { data: logsData } = await supabase!
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });
          setAuditLogs(logsData || []);
        }
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      showToast('Gagal memuat data dari database.', 'error');
    }
  };

  // Setup realtime listeners
  const setupRealtime = (user: User) => {
    // Clean up first
    realtimeSubscriptions.current.forEach(unsubscribe => unsubscribe());
    realtimeSubscriptions.current = [];

    if (isSimulator) {
      // Simulator subscriptions
      const unsubReports = simulator.subscribe('reports', '*', (_payload: any) => {
        setReports(simulator.getReports());
        // Auto trigger notifications reload if related
        setNotifications(simulator.getNotifications(user.id));
      });
      
      const unsubNotifs = simulator.subscribe('notifications', 'INSERT', (newNotif: Notification) => {
        if (newNotif.user_id === user.id) {
          setNotifications(prev => [newNotif, ...prev]);
          showToast(`🔔 ${newNotif.title}: ${newNotif.message}`, 'info');
        }
      });

      const unsubHistory = simulator.subscribe('status_history', 'INSERT', () => {
        // Refresh if reports changes
        setReports(simulator.getReports());
      });

      realtimeSubscriptions.current.push(unsubReports, unsubNotifs, unsubHistory);
    } else {
      // Real Supabase channels
      const reportsChannel = supabase!
        .channel('reports-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
          refreshData(user);
        })
        .subscribe();

      const notificationsChannel = supabase!
        .channel('notifications-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          showToast(`🔔 ${newNotif.title}: ${newNotif.message}`, 'info');
        })
        .subscribe();

      realtimeSubscriptions.current.push(
        () => supabase!.removeChannel(reportsChannel),
        () => supabase!.removeChannel(notificationsChannel)
      );
    }
  };

  // Effect to load initial session
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      if (isSimulator) {
        const sessionUser = simulator.getSessionUser();
        setCurrentUser(sessionUser);
        if (sessionUser) {
          await refreshData(sessionUser);
          setupRealtime(sessionUser);
        }
      } else {
        // Supabase Auth Listener
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          // Fetch profile details
          const { data: profile } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setCurrentUser(profile as User);
            await refreshData(profile as User);
            setupRealtime(profile as User);
          }
        }
        
        // Listen for auth state changes
        supabase!.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase!
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile) {
              setCurrentUser(profile as User);
              await refreshData(profile as User);
              setupRealtime(profile as User);
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            refreshData(null);
            realtimeSubscriptions.current.forEach(unsub => unsub());
            realtimeSubscriptions.current = [];
          }
        });
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      realtimeSubscriptions.current.forEach(unsub => unsub());
    };
  }, []);

  // ====================================================================
  // AUTHENTICATION IMPLEMENTATION
  // ====================================================================

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSimulator) {
        const { data, error } = await simulator.signIn(email, password);
        if (error) throw error;
        setCurrentUser(data.user);
        if (data.user) {
          await refreshData(data.user);
          setupRealtime(data.user);
        }
        showToast('Login berhasil! Selamat datang.', 'success');
      } else {
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Profile is handled in auth listener, but let's refresh
        showToast('Login berhasil!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Login gagal.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, fullName: string, phone: string) => {
    setLoading(true);
    try {
      if (isSimulator) {
        const { data, error } = await simulator.signUp(email, fullName, phone);
        if (error) throw error;
        setCurrentUser(data.user);
        if (data.user) {
          await refreshData(data.user);
          setupRealtime(data.user);
        }
        showToast('Registrasi berhasil! Akun otomatis login.', 'success');
      } else {
        // Supabase sign up
        const { data, error } = await supabase!.auth.signUp({
          email,
          password: 'RudiWarga2026!', // default password or custom password in a real form
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              role: 'citizen'
            }
          }
        });
        if (error) throw error;
        
        // Profiles are usually created via Supabase Triggers, or insert manually if no trigger
        if (data.user) {
          await supabase!.from('profiles').insert({
            id: data.user.id,
            email,
            role: 'citizen',
            full_name: fullName,
            phone,
            active: true
          });
        }
        showToast('Registrasi berhasil! Silakan periksa email Anda.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Registrasi gagal.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSimulator) {
        await simulator.signOut();
        setCurrentUser(null);
        refreshData(null);
        realtimeSubscriptions.current.forEach(unsub => unsub());
        realtimeSubscriptions.current = [];
        showToast('Logout berhasil.', 'success');
      } else {
        const { error } = await supabase!.auth.signOut();
        if (error) throw error;
        showToast('Logout berhasil.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal logout.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fullName: string, phone: string, avatarUrl?: string) => {
    try {
      if (isSimulator) {
        const { user, error } = simulator.updateProfile(fullName, phone, avatarUrl);
        if (error) throw error;
        setCurrentUser(user);
        showToast('Profil berhasil diperbarui.', 'success');
      } else {
        if (!currentUser) return;
        const { error } = await supabase!
          .from('profiles')
          .update({ full_name: fullName, phone, avatar_url: avatarUrl })
          .eq('id', currentUser.id);
        if (error) throw error;
        setCurrentUser(prev => prev ? { ...prev, full_name: fullName, phone, avatar_url: avatarUrl } : null);
        showToast('Profil berhasil diperbarui.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui profil.', 'error');
    }
  };

  // ====================================================================
  // DATABASE ACTIONS IMPLEMENTATION
  // ====================================================================

  const createReport = async (reportData: any): Promise<Report> => {
    if (isSimulator) {
      const { report, error } = simulator.createReport(reportData);
      if (error) throw error;
      setReports(simulator.getReports());
      showToast('Laporan berhasil dikirim!', 'success');
      return report!;
    } else {
      // Create Report on Real Supabase
      const year = new Date().getFullYear();
      const { count } = await supabase!
        .from('reports')
        .select('*', { count: 'exact', head: true });
      const ticket_number = `JKP-${year}-${((count || 0) + 1).toString().padStart(6, '0')}`;

      const { data, error } = await supabase!
        .from('reports')
        .insert({
          ...reportData,
          ticket_number,
          status: 'Laporan Berhasil Dikirim',
          progress: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto trigger verification queue change log
      await supabase!.from('status_history').insert({
        report_id: data.id,
        status: 'Laporan Berhasil Dikirim',
        notes: 'Laporan berhasil disubmit oleh masyarakat.',
        updated_by_name: currentUser!.full_name,
        updated_by_role: 'citizen'
      });

      await supabase!.from('reports').update({ status: 'Menunggu Verifikasi Admin' }).eq('id', data.id);
      
      await supabase!.from('status_history').insert({
        report_id: data.id,
        status: 'Menunggu Verifikasi Admin',
        notes: 'Sistem mengalokasikan laporan ke antrean dinas.',
        updated_by_name: 'Sistem',
        updated_by_role: 'admin'
      });

      showToast('Laporan berhasil dikirim!', 'success');
      return data as Report;
    }
  };

  const verifyReport = async (reportId: string, action: 'accept' | 'reject' | 'revise', params: any): Promise<Report> => {
    if (isSimulator) {
      const { report, error } = simulator.verifyReport(reportId, action, params);
      if (error) throw error;
      setReports(simulator.getReports());
      if (action === 'accept') {
        showToast('Laporan diterima & siap ditugaskan.', 'success');
      } else {
        showToast('Laporan berhasil ditolak.', 'warning');
      }
      return report!;
    } else {
      let status: ReportStatus = action === 'accept' ? 'Laporan Diterima' : 'Ditolak';
      let updates: any = { status, updated_at: new Date().toISOString() };
      
      if (action === 'accept') {
        updates.severity = params.severity;
        updates.category = params.category;
        updates.priority = params.priority;
        updates.admin_notes = params.notes;
      } else {
        updates.rejection_reason = params.reason;
      }

      const { data, error } = await supabase!
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      // Status History
      await supabase!.from('status_history').insert({
        report_id: reportId,
        status,
        notes: action === 'accept' 
          ? `Laporan diterima admin. Kategori: ${params.category}, Keparahan: ${params.severity}, Prioritas: ${params.priority}. Catatan: ${params.notes || '-'}`
          : `Laporan ditolak admin. Alasan: ${params.reason}`,
        updated_by_name: currentUser!.full_name,
        updated_by_role: 'admin'
      });

      if (action === 'accept') {
        // Auto transition
        await supabase!.from('reports').update({ status: 'Menunggu Penugasan Teknisi' }).eq('id', reportId);
        await supabase!.from('status_history').insert({
          report_id: reportId,
          status: 'Menunggu Penugasan Teknisi',
          notes: 'Laporan masuk antrean penugasan Koordinator Lapangan.',
          updated_by_name: 'Sistem',
          updated_by_role: 'admin'
        });
      }

      showToast(action === 'accept' ? 'Laporan berhasil diverifikasi.' : 'Laporan ditolak.', 'success');
      return data as Report;
    }
  };

  const assignTechnician = async (reportId: string, technicianId: string, priority?: PriorityLevel): Promise<Report> => {
    if (isSimulator) {
      const { report, error } = simulator.assignTechnician(reportId, technicianId, priority);
      if (error) throw error;
      setReports(simulator.getReports());
      showToast('Teknisi berhasil ditugaskan!', 'success');
      return report!;
    } else {
      const updates: any = {
        status: 'Teknisi Ditugaskan',
        technician_id: technicianId,
        coordinator_id: currentUser!.id,
        updated_at: new Date().toISOString()
      };
      if (priority) updates.priority = priority;

      const { data, error } = await supabase!
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;

      // Get technician name
      const { data: techProfile } = await supabase!
        .from('profiles')
        .select('full_name')
        .eq('id', technicianId)
        .single();

      await supabase!.from('status_history').insert({
        report_id: reportId,
        status: 'Teknisi Ditugaskan',
        notes: `Koordinator menugaskan Teknisi: ${techProfile?.full_name || 'Teknisi Lapangan'}.`,
        updated_by_name: currentUser!.full_name,
        updated_by_role: 'coordinator'
      });

      showToast('Teknisi berhasil ditugaskan!', 'success');
      return data as Report;
    }
  };

  const updateReportStatusByTechnician = async (reportId: string, status: any, params: any): Promise<Report> => {
    if (isSimulator) {
      const { report, error } = simulator.updateReportStatusByTechnician(reportId, status, params);
      if (error) throw error;
      setReports(simulator.getReports());
      showToast(`Status pekerjaan diperbarui ke: ${status}`, 'success');
      return report!;
    } else {
      let progress = 10;
      let updates: any = { status, updated_at: new Date().toISOString() };

      if (status === 'Survei Lapangan') {
        progress = 10;
        if (params.beforeImages) updates.images_before = params.beforeImages;
        updates.technician_notes = params.notes || 'Survei lapangan selesai.';
      } else if (status === 'Sedang Dalam Perbaikan') {
        progress = params.progress !== undefined ? params.progress : 25;
        if (params.progressImages) updates.images_progress = params.progressImages;
        updates.technician_notes = params.notes;
      } else if (status === 'Menunggu Verifikasi Akhir') {
        progress = 100;
        if (params.afterImages) updates.images_after = params.afterImages;
        updates.technician_notes = params.notes || 'Perbaikan rampung.';
      }

      updates.progress = progress;

      const { data, error } = await supabase!
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;

      await supabase!.from('status_history').insert({
        report_id: reportId,
        status,
        notes: `Teknisi update: ${updates.technician_notes} (Progress: ${progress}%).`,
        updated_by_name: currentUser!.full_name,
        updated_by_role: 'technician'
      });

      showToast(`Status pekerjaan diperbarui.`, 'success');
      return data as Report;
    }
  };

  const approveCompletion = async (reportId: string, approve: boolean, notes?: string): Promise<Report> => {
    if (isSimulator) {
      const { report, error } = simulator.approveCompletion(reportId, approve, notes);
      if (error) throw error;
      setReports(simulator.getReports());
      showToast(approve ? 'Pekerjaan selesai disetujui!' : 'Instruksi pengerjaan ulang dikirim.', approve ? 'success' : 'warning');
      return report!;
    } else {
      let status: ReportStatus = approve ? 'Perbaikan Selesai' : 'Sedang Dalam Perbaikan';
      let updates: any = { 
        status, 
        admin_notes: notes || (approve ? 'Hasil disetujui.' : 'Perlu perbaikan tambahan.'),
        updated_at: new Date().toISOString()
      };
      
      if (approve) {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.progress = 75; // Lower progress
      }

      const { data, error } = await supabase!
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;

      await supabase!.from('status_history').insert({
        report_id: reportId,
        status,
        notes: approve 
          ? `Pekerjaan disetujui admin: ${updates.admin_notes}.`
          : `Admin meminta pengerjaan ulang: ${updates.admin_notes}. Progress diturunkan ke 75%.`,
        updated_by_name: currentUser!.full_name,
        updated_by_role: 'admin'
      });

      showToast(approve ? 'Pekerjaan selesai disetujui!' : 'Laporan revisi dikirim.', 'success');
      return data as Report;
    }
  };

  const submitFeedback = async (reportId: string, rating: number, comment: string): Promise<Report> => {
    if (isSimulator) {
      const { report, error } = simulator.submitFeedback(reportId, rating, comment);
      if (error) throw error;
      setReports(simulator.getReports());
      showToast('Ulasan berhasil dikirim! Laporan ditutup.', 'success');
      return report!;
    } else {
      const { data, error } = await supabase!
        .from('reports')
        .update({
          status: 'Laporan Ditutup',
          rating,
          citizen_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;

      await supabase!.from('status_history').insert({
        report_id: reportId,
        status: 'Laporan Ditutup',
        notes: `Masyarakat menutup laporan dengan ulasan bintang ${rating}. Ulasan: "${comment}"`,
        updated_by_name: currentUser!.full_name,
        updated_by_role: 'citizen'
      });

      showToast('Terima kasih atas ulasan Anda! Laporan ditutup.', 'success');
      return data as Report;
    }
  };

  const markNotificationRead = async (notifId: string) => {
    if (isSimulator) {
      simulator.markNotificationRead(notifId);
      setNotifications(simulator.getNotifications(currentUser!.id));
    } else {
      await supabase!
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    }
  };

  const getStatusHistory = async (reportId: string): Promise<StatusHistory[]> => {
    if (isSimulator) {
      return simulator.getStatusHistory(reportId);
    } else {
      const { data, error } = await supabase!
        .from('status_history')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as StatusHistory[];
    }
  };

  const uploadFile = async (bucket: string, file: File): Promise<string> => {
    if (isSimulator) {
      const { publicUrl, error } = await simulator.uploadFile(bucket, file);
      if (error) throw error;
      return publicUrl;
    } else {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase!
        .storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase!
        .storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    }
  };

  // ====================================================================
  // ADMIN STAFF MANAGEMENT (CRUD)
  // ====================================================================

  const getStaffUsers = (): User[] => {
    if (isSimulator) {
      return simulator.getUsers().filter(u => u.role !== 'citizen');
    }
    // For real Supabase, would query profiles. Since this is admin panel, return current active list
    return [];
  };

  const createStaffUser = async (email: string, fullName: string, phone: string, role: UserRole): Promise<User> => {
    if (isSimulator) {
      const { user, error } = simulator.createStaffUser(email, fullName, phone, role);
      if (error) throw error;
      showToast(`Akun ${role} berhasil dibuat!`, 'success');
      return user!;
    } else {
      // In real Supabase, creating auth accounts from client is restricted, 
      // but admins can invoke Edge Functions or we insert a profile and let them login/reset.
      // For this demo, let's write to profiles
      const { data: { user: authUser }, error: authError } = await supabase!.auth.signUp({
        email,
        password: 'PUPRStaff2026!', // Standard starter password
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role
          }
        }
      });
      if (authError) throw authError;

      const { data, error } = await supabase!
        .from('profiles')
        .insert({
          id: authUser!.id,
          email,
          role,
          full_name: fullName,
          phone,
          active: true
        })
        .select()
        .single();
      if (error) throw error;

      showToast(`Akun staff berhasil dibuat.`, 'success');
      return data as User;
    }
  };

  const toggleUserActive = async (userId: string) => {
    if (isSimulator) {
      const { error } = simulator.toggleUserActive(userId);
      if (error) throw error;
      showToast('Status keaktifan akun diperbarui.', 'success');
    } else {
      // Fetch current status
      const { data: u } = await supabase!.from('profiles').select('active').eq('id', userId).single();
      const { error } = await supabase!
        .from('profiles')
        .update({ active: !u?.active })
        .eq('id', userId);
      if (error) throw error;
      showToast('Status keaktifan akun diperbarui.', 'success');
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    if (isSimulator) {
      const { error } = simulator.updateUserRole(userId, role);
      if (error) throw error;
      showToast('Role akun berhasil diubah.', 'success');
    } else {
      const { error } = await supabase!
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
      showToast('Role akun berhasil diubah.', 'success');
    }
  };

  const deleteUser = async (userId: string) => {
    if (isSimulator) {
      const { error } = simulator.deleteUser(userId);
      if (error) throw error;
      showToast('Akun berhasil dihapus.', 'success');
    } else {
      const { error } = await supabase!
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
      showToast('Akun berhasil dihapus.', 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loading,
        reports,
        notifications,
        auditLogs,
        toasts,
        showToast,
        dismissToast,
        isOfflineMode: isSimulator,
        login,
        register,
        logout,
        updateProfile,
        createReport,
        verifyReport,
        assignTechnician,
        updateReportStatusByTechnician,
        approveCompletion,
        submitFeedback,
        markNotificationRead,
        getStatusHistory,
        uploadFile,
        getStaffUsers,
        createStaffUser,
        toggleUserActive,
        updateUserRole,
        deleteUser,
        districts: PECANBARU_DISTRICTS,
        subdistricts: PECANBARU_SUBDISTRICTS,
        categories: DAMAGE_CATEGORIES
      }}
    >
      {children}
      
      {/* Dynamic Toast Portal UI */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border border-white/10 backdrop-blur-md flex items-center justify-between text-sm transition-all duration-300 transform translate-y-0 animate-slide-in-up ${
              t.type === 'success' ? 'bg-success/90 text-white' :
              t.type === 'warning' ? 'bg-warning/90 text-white' :
              t.type === 'error' ? 'bg-danger/90 text-white' :
              'bg-primary/95 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">
                {t.type === 'success' && '✓'}
                {t.type === 'warning' && '⚠'}
                {t.type === 'error' && '✕'}
                {t.type === 'info' && 'ℹ'}
              </span>
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="ml-4 text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
