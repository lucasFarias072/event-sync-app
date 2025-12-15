

import { NextResponse } from 'next/server'
import { eventService } from '@/services/event.service'
import { createClient } from '@/lib/supabase-route-handler'
// import { createClient } from '@/lib/supabase-server'
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'

// GET /api/events - Listar todos os eventos publicados
export async function GET(request) {
  try {
    const events = await eventService.getAllPublished()
    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}

// POST /api/events - Criar novo evento
export async function POST(request) {
  try {
    console.log('Cookies recebidos:', request.cookies.getAll())
    // Verificar autenticação
    // const supabase = createRouteHandlerClient({ cookies })
    const supabase = await createClient()

    // Erros ao criar evento: POST /api/events 401
    // Solução: usar getUser()
    // const { data: { session } } = await supabase.auth.getSession()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if(authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const event = await eventService.create(body, user.id)
    // const event = await eventService.create(body, session.user.id)

    return NextResponse.json(event, { status: 201 })
  } catch (error) {

    // LOG DETALHADO DO ERRO
    console.error('=== ERRO COMPLETO ===')
    console.error('Mensagem:', error.message)
    console.error('Nome:', error.name)
    console.error('Stack:', error.stack)
    console.error('Status Code:', error.statusCode)
    console.error('=====================')
    
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
