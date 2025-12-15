

import { NextResponse } from 'next/server'
import { eventService } from '@/services/event.service'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const events = await eventService.getByOrganizer(id)
    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode || 500 }
    )
  }
}
