

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
// import Image from "next/image";

function contentForAuthenticatedUser() {
    return (
        <>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">Meu Painel</Link>
            <Link href="/events/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Criar Evento
            </Link>
        </>
    )
}

function contentForUnauthenticatedUser() {
    return (
        <>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">Entrar</Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Cadastrar
            </Link>
        </>
    )
}

function renderEvents(events) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
            <Link 
                key={event.id} 
                href={`/events/${event.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.brief_description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(event.start_date).toLocaleDateString('pt-BR')}</span>
                    <span>por {event.profiles?.username}</span>
                </div>
                </div>
            </Link>
            ))}
        </div>
    )
}

export default function Home() {

  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      loadEvents()
  }, [])

  const loadEvents = async () => {
    const { data, error } = await supabase.from('events')
    .select("*, profiles:organizer_id (username, rating)")
    .eq('is_published', true)
    .order('start_date', { ascending: true })

    if (!error) setEvents(data || []) 
    setLoading(false)
  }

  return (
        <div className="min-h-screen bg-gray-50">
        
        {/* Cabeçalho */}
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            
                {/* Duas visões p/ usuário existir ou não */}
                <div className="flex gap-4">
                    {user ? (contentForAuthenticatedUser()) : (contentForUnauthenticatedUser())}
                </div>

            </div>
        </header>

        {/* Feed de Eventos */}
        <main className="max-w-7xl mx-auto px-4 py-8">
            {loading ? (
            <p className="text-center text-gray-600">Carregando eventos...</p>
            ) : events.length === 0 ? (
            <p className="text-center text-gray-600">Nenhum evento publicado ainda.</p>
            ) : (
            renderEvents(events)
            )}
        </main>
        </div>
    )
}
