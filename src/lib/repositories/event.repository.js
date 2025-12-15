

import { supabase } from '../supabase'

class EventRepository {

  // -------------------------------------------------------------------------------------------------------------- CRUD
  async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(eventId, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
    return true
  }
  
  // ----------------------------------------------------------------------------------------------------------- QUERIES
  async findAllPublished() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:organizer_id (id, username, rating)
      `)
      .eq('is_published', true)
      .order('start_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  async findById(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:organizer_id (id, username, full_name, rating)
      `)
      .eq('id', eventId)
      .single()

    if (error) throw error
    return data
  }

  async findByOrganizerId(organizerId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // -------------------------------------------------------------------------------------------------------------- PUTS
  async publish(eventId) {
    return this.update(eventId, { is_published: true })
  }

  async closeEnrollments(eventId) {
    return this.update(eventId, { status: 'closed' })
  }
}

// Singleton
const eventRepository = new EventRepository()
export { eventRepository }
