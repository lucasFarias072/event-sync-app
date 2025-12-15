

import { NextResponse } from 'next/server'
import { eventService } from '@/services/event.service'
import { createClient } from '@/lib/supabase-server'
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'

// GET /api/events/[id] - Buscar evento por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params 
    const event = await eventService.getById(id)
    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}

// PUT /api/events/[id] - Atualizar evento
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {  
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id } = await params  
    const event = await eventService.update(id, body, user.id)  

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}

// DELETE /api/events/[id] - Deletar evento
export async function DELETE(request, { params }) {
  try {
    // const supabase = createRouteHandlerClient({ cookies })
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    const { id } = await params
    await eventService.delete(id, session.user.id)
    return NextResponse.json({ message: 'Evento deletado com sucesso' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
