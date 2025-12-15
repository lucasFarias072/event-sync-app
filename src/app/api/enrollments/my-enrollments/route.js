

import { NextResponse } from 'next/server'
import { enrollmentService } from '@/services/enrollment.service'
import { createClient } from '@/lib/supabase-route-handler'

// GET /api/enrollments/my-enrollments - Buscar inscrições do usuário logado
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const enrollments = await enrollmentService.getParticipantEnrollments(user.id)

    return NextResponse.json(enrollments, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error)
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}