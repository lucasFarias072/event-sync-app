

import { eventRepository } from '@/lib/repositories/event.repository'
import { NotFoundException } from '@/exceptions/NotFoundException'
import { ValidationException } from '@/exceptions/ValidationException'
import { UnauthorizedException } from '@/exceptions/UnauthorizedException'

class EventService {

  // -------------------------------------------------------------------------------------------------------------- CRUD
  async create(eventData, userId) {
    // Validações
    if (!eventData.title || eventData.title.trim() === '') {
      throw new ValidationException('Título do evento é obrigatório')
    }

    if (!eventData.start_date) {
      throw new ValidationException('Data de início é obrigatória')
    }

    if (!eventData.end_date) {
      throw new ValidationException('Data de término é obrigatória')
    }

    const startDate = new Date(eventData.start_date)
    const endDate = new Date(eventData.end_date)

    if (endDate <= startDate) {
      throw new ValidationException('Data de término deve ser após a data de início')
    }

    // Adicionar organizador
    const eventToCreate = {
      ...eventData,
      organizer_id: userId,
      is_published: false,
      status: 'open'
    }

    return await eventRepository.create(eventToCreate)
  }

  async update(eventId, eventData, userId) {
    // Verificar se evento existe
    const event = await this.getById(eventId)

    // Verificar se usuário é o organizador
    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode editar este evento')
    }

    // Validar datas se fornecidas
    if (eventData.start_date && eventData.end_date) {
      const startDate = new Date(eventData.start_date)
      const endDate = new Date(eventData.end_date)

      if (endDate <= startDate) {
        throw new ValidationException('Data de término deve ser após a data de início')
      }
    }

    return await eventRepository.update(eventId, eventData)
  }

  async delete(eventId, userId) {
    const event = await this.getById(eventId)

    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode deletar este evento')
    }

    return await eventRepository.delete(eventId)
  }

  // ----------------------------------------------------------------------------------------------------------- QUERIES
  async getAllPublished() {
    const events = await eventRepository.findAllPublished()
    
    if (!events || events.length === 0) {
      throw new NotFoundException('Nenhum evento publicado encontrado')
    }
    
    return events
  }

  async getById(eventId) {
    if (!eventId) {
      throw new ValidationException('ID do evento é obrigatório')
    }

    const event = await eventRepository.findById(eventId)
    
    if (!event) {
      throw new NotFoundException('Evento não encontrado')
    }

    return event
  }

  async getByOrganizer(organizerId) {
    if (!organizerId) {
      throw new ValidationException('ID do organizador é obrigatório')
    }

    const events = await eventRepository.findByOrganizerId(organizerId)
    return events // Pode retornar array vazio
  }

  // -------------------------------------------------------------------------------------------------------------- PUTS
  async publish(eventId, userId) {
    const event = await this.getById(eventId)

    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode publicar este evento')
    }

    return await eventRepository.publish(eventId)
  }

  async closeEnrollments(eventId, userId) {
    const event = await this.getById(eventId)

    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode fechar inscrições')
    }

    return await eventRepository.closeEnrollments(eventId)
  }
}

// Singleton
const eventService = new EventService()
export { eventService }
