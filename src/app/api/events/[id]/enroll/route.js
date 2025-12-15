

import { NextResponse } from 'next/server'
import { enrollmentService } from '@/services/enrollment.service'
import { createClient } from '@/lib/supabase-route-handler'

// POST /api/events/[id]/enroll - Inscrever-se no evento
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const enrollment = await enrollmentService.enroll(id, user.id)

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar inscrição:', error)
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
