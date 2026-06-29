export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'citizen' | 'admin' | 'coordinator' | 'technician'
          full_name: string
          phone: string
          avatar_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'citizen' | 'admin' | 'coordinator' | 'technician'
          full_name: string
          phone: string
          avatar_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'citizen' | 'admin' | 'coordinator' | 'technician'
          full_name?: string
          phone?: string
          avatar_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          ticket_number: string
          citizen_id: string
          citizen_name: string
          citizen_phone: string
          citizen_email: string
          title: string
          description: string
          category: string
          severity: string
          city: string
          district: string
          subdistrict: string
          street_name: string
          latitude: number
          longitude: number
          images_before: string[]
          images_progress: string[]
          images_after: string[]
          video_url: string | null
          status: string
          progress: number
          priority: string | null
          admin_notes: string | null
          rejection_reason: string | null
          coordinator_id: string | null
          technician_id: string | null
          technician_notes: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          rating: number | null
          citizen_comment: string | null
        }
        Insert: {
          id?: string
          ticket_number: string
          citizen_id: string
          citizen_name: string
          citizen_phone: string
          citizen_email: string
          title: string
          description: string
          category: string
          severity: string
          city: string
          district: string
          subdistrict: string
          street_name: string
          latitude: number
          longitude: number
          images_before?: string[]
          images_progress?: string[]
          images_after?: string[]
          video_url?: string | null
          status?: string
          progress?: number
          priority?: string | null
          admin_notes?: string | null
          rejection_reason?: string | null
          coordinator_id?: string | null
          technician_id?: string | null
          technician_notes?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          rating?: number | null
          citizen_comment?: string | null
        }
        Update: {
          ticket_number?: string
          citizen_id?: string
          citizen_name?: string
          citizen_phone?: string
          citizen_email?: string
          title?: string
          description?: string
          category?: string
          severity?: string
          city?: string
          district?: string
          subdistrict?: string
          street_name?: string
          latitude?: number
          longitude?: number
          images_before?: string[]
          images_progress?: string[]
          images_after?: string[]
          video_url?: string | null
          status?: string
          progress?: number
          priority?: string | null
          admin_notes?: string | null
          rejection_reason?: string | null
          coordinator_id?: string | null
          technician_id?: string | null
          technician_notes?: string | null
          updated_at?: string
          completed_at?: string | null
          rating?: number | null
          citizen_comment?: string | null
        }
      }
      status_history: {
        Row: {
          id: string
          report_id: string
          status: string
          notes: string | null
          updated_by_name: string
          updated_by_role: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          status: string
          notes?: string | null
          updated_by_name: string
          updated_by_role: string
          created_at?: string
        }
        Update: {
          status?: string
          notes?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          report_id: string
          ticket_number: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          report_id: string
          ticket_number: string
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_role: string
          action: string
          details: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          user_role: string
          action: string
          details: string
          created_at?: string
        }
      }
      districts: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          name?: string
        }
      }
      subdistricts: {
        Row: {
          id: string
          district_id: string
          name: string
        }
        Insert: {
          id?: string
          district_id: string
          name: string
        }
        Update: {
          name?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
