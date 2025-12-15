

import { NextResponse } from 'next/server'
import { enrollmentService } from '@/services/enrollment.service'
import { createClient } from '@/lib/supabase-route-handler'

// GET /api/enrollments/check/[eventId] - Verificar status de inscrição
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ enrolled: false }, { status: 200 })
    }

    const { eventId } = await params
    const status = await enrollmentService.checkEnrollmentStatus(eventId, user.id)

    return NextResponse.json(status, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
