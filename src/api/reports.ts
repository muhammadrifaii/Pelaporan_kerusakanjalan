import { supabase, isSimulator } from '../lib/supabase'
import type { Report } from '../types'

// Generate ticket number
export const generateTicketNumber = (): string => {
  const year = new Date().getFullYear()
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 900000) + 100000
  return `JKP-${year}-${timestamp}-${random}`
}

// Reports API
export const reportsAPI = {
  async createReport(data: Partial<Report>) {
    if (isSimulator || !supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const ticket = generateTicketNumber()
      const { data: reportData, error } = await supabase
        .from('reports')
        .insert({
          ...data,
          ticket_number: ticket,
          status: 'Laporan Berhasil Dikirim',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { data: reportData, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async getReports(filters?: { citizenId?: string; status?: string }) {
    if (isSimulator || !supabase) {
      return { data: [], error: new Error('Supabase not available') }
    }

    try {
      let query = supabase.from('reports').select('*')

      if (filters?.citizenId) {
        query = query.eq('citizen_id', filters.citizenId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return { data: data as Report[], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getReportByTicket(ticketNumber: string) {
    if (isSimulator || !supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .single()

      if (error) throw error
      return { data: data as Report, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async updateReport(reportId: string, updates: Partial<Report>) {
    if (isSimulator || !supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error
      return { data: data as Report, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },
}

// Upload file to Supabase Storage
export const storageAPI = {
  async uploadFile(bucket: string, path: string, file: File) {
    if (isSimulator || !supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (error) throw error

      // Get public URL
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)

      return { data: publicData?.publicUrl, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async deleteFile(bucket: string, path: string) {
    if (isSimulator || !supabase) {
      return { error: new Error('Supabase not available') }
    }

    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}

// Districts & Subdistricts API
export const locationAPI = {
  async getDistricts() {
    if (isSimulator || !supabase) {
      return { data: [], error: new Error('Supabase not available') }
    }

    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getSubdistricts(districtId: string) {
    if (isSimulator || !supabase) {
      return { data: [], error: new Error('Supabase not available') }
    }

    try {
      const { data, error } = await supabase
        .from('subdistricts')
        .select('*')
        .eq('district_id', districtId)
        .order('name')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },
}
