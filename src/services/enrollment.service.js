

import { enrollmentRepository } from '@/lib/repositories/enrollment.repository'
import { eventRepository } from '@/lib/repositories/event.repository'
import { NotFoundException } from '@/exceptions/NotFoundException'
import { ValidationException } from '@/exceptions/ValidationException'
import { UnauthorizedException } from '@/exceptions/UnauthorizedException'

class EnrollmentService {

  // Criar inscrição
  async enroll(eventId, participantId) {
    // Validações
    if (!eventId) {
      throw new ValidationException('ID do evento é obrigatório')
    }

    if (!participantId) {
      throw new ValidationException('ID do participante é obrigatório')
    }

    // Verificar se evento existe
    const event = await eventRepository.findById(eventId)
    if (!event) {
      throw new NotFoundException('Evento não encontrado')
    }

    // Verificar se evento está aberto para inscrições
    if (event.status !== 'open') {
      throw new ValidationException('Este evento não está aceitando inscrições')
    }

    if (!event.is_published) {
      throw new ValidationException('Este evento não está publicado')
    }

    // Não permitir organizador se inscrever no próprio evento
    if (event.organizer_id === participantId) {
      throw new ValidationException('Você não pode se inscrever no seu próprio evento')
    }

    // Verificar se já está inscrito
    const existing = await enrollmentRepository.findByEventAndParticipant(eventId, participantId)
    if (existing) {
      throw new ValidationException('Você já está inscrito neste evento')
    }

    // Verificar capacidade
    if (event.capacity) {
      const enrolledCount = await enrollmentRepository.countApprovedByEvent(eventId)
      if (enrolledCount >= event.capacity) {
        throw new ValidationException('Evento lotado')
      }
    }

    // Criar inscrição
    const enrollmentData = {
      event_id: eventId,
      participant_id: participantId,
      status: event.requires_approval ? 'pending' : 'approved',
      checked_in: false
    }

    return await enrollmentRepository.create(enrollmentData)
  }

  // Verificar status de inscrição
  async checkEnrollmentStatus(eventId, participantId) {
    const enrollment = await enrollmentRepository.findByEventAndParticipant(eventId, participantId)
    return enrollment ? { enrolled: true, status: enrollment.status } : { enrolled: false }
  }

  // Buscar inscrição por ID
  async getById(enrollmentId) {
    if (!enrollmentId) {
      throw new ValidationException('ID da inscrição é obrigatório')
    }

    const enrollment = await enrollmentRepository.findById(enrollmentId)
    if (!enrollment) {
      throw new NotFoundException('Inscrição não encontrada')
    }

    return enrollment
  }

  // Listar inscrições de um evento (organizador)
  async getEventEnrollments(eventId, userId) {
    const event = await eventRepository.findById(eventId)
    
    if (!event) {
      throw new NotFoundException('Evento não encontrado')
    }

    // Apenas organizador pode ver as inscrições
    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode ver as inscrições')
    }

    return await enrollmentRepository.findByEventId(eventId)
  }

  // Listar inscrições de um participante
  async getParticipantEnrollments(participantId) {
    if (!participantId) {
      throw new ValidationException('ID do participante é obrigatório')
    }

    return await enrollmentRepository.findByParticipantId(participantId)
  }

  // Aprovar inscrição (organizador)
  async approve(enrollmentId, userId) {
    const enrollment = await this.getById(enrollmentId)
    const event = await eventRepository.findById(enrollment.event_id)

    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode aprovar inscrições')
    }

    return await enrollmentRepository.updateStatus(enrollmentId, 'approved')
  }

  // Recusar inscrição (organizador)
  async reject(enrollmentId, userId) {
    const enrollment = await this.getById(enrollmentId)
    const event = await eventRepository.findById(enrollment.event_id)

    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode recusar inscrições')
    }

    return await enrollmentRepository.updateStatus(enrollmentId, 'rejected')
  }

  // Cancelar inscrição (participante)
  async cancel(enrollmentId, userId) {
    const enrollment = await this.getById(enrollmentId)

    if (enrollment.participant_id !== userId) {
      throw new UnauthorizedException('Você só pode cancelar suas próprias inscrições')
    }

    if (enrollment.checked_in) {
      throw new ValidationException('Não é possível cancelar após fazer check-in')
    }

    return await enrollmentRepository.cancel(enrollmentId)
  }

  // Registrar check-in
  async checkIn(enrollmentId, userId) {
    const enrollment = await this.getById(enrollmentId)
    const event = await eventRepository.findById(enrollment.event_id)

    // Apenas organizador pode fazer check-in
    if (event.organizer_id !== userId) {
      throw new UnauthorizedException('Apenas o organizador pode registrar check-in')
    }

    if (enrollment.status !== 'approved') {
      throw new ValidationException('Apenas inscrições aprovadas podem fazer check-in')
    }

    if (enrollment.checked_in) {
      throw new ValidationException('Check-in já realizado')
    }

    return await enrollmentRepository.checkIn(enrollmentId)
  }
}

const enrollmentService = new EnrollmentService()
export { enrollmentService }