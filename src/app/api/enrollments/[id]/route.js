import { NextResponse } from 'next/server'
import { enrollmentService } from '@/services/enrollment.service'
import { createClient } from '@/lib/supabase-route-handler'

// GET /api/enrollments/[id] - Buscar inscrição por ID
export async function GET(request, { params }) {
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
    const enrollment = await enrollmentService.getById(id)

    return NextResponse.json(enrollment, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar inscrição:', error)
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}