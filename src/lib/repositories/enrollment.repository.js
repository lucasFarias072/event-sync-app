

import { supabase } from '../supabase'

class EnrollmentRepository {

  // --------------------------------------------------------------------------------------------------------------------- CRUD
  async create(enrollmentData) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Atualizar status da inscrição
  async updateStatus(enrollmentId, status) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Registrar check-in
  async checkIn(enrollmentId) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ 
        checked_in: true,
        checked_in_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Cancelar inscrição
  async cancel(enrollmentId) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status: 'cancelled' })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }
  
  // ------------------------------------------------------------------------------------------------------------------- QUERIES
  // Buscar por ID
  async findById(enrollmentId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        events (*),
        profiles:participant_id (id, username, full_name)
      `)
      .eq('id', enrollmentId)
      .single()

    if (error) throw error
    return data
  }

  // Verificar se usuário já está inscrito
  async findByEventAndParticipant(eventId, participantId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('event_id', eventId)
      .eq('participant_id', participantId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  }

  // Listar inscrições de um evento
  async findByEventId(eventId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        profiles:participant_id (id, username, full_name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Listar inscrições de um usuário
  async findByParticipantId(participantId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        events (
          id, title, brief_description, start_date, end_date, 
          location, status, banner_url,
          profiles:organizer_id (username, rating)
        )
      `)
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Contar inscrições aprovadas de um evento
  async countApprovedByEvent(eventId) {
    const { count, error } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'approved')

    if (error) throw error
    return count || 0
  }
}

const enrollmentRepository = new EnrollmentRepository()
export { enrollmentRepository }
