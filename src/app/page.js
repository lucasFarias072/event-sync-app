

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
// import Image from "next/image";

function contentForAuthenticatedUser() {
    return (
        <>
            <Link href="/dashboard" className="text-[#bec8cd] hover:text-white">Meu Painel</Link>
            <Link href="/events/create" className="bg-[#4db9e5] text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Criar Evento
            </Link>
        </>
    )
}

function contentForUnauthenticatedUser() {
    return (
        <>
            <Link href="/login" className="bg-[#bec8cd] text-gray-600 hover:text-gray-900 py-3 px-3 rounded-md">Entrar</Link>
            <Link href="/register" className="bg-[#4db9e5] text-white px-4 py-2 rounded-lg hover:bg-[#6b7a99]">
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
                className="bg-[#170666] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
                <div className="h-16 bg-gradient-to-r from-[#170666] to-[#1e068b]"></div>
                <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-[#bec8cd]">{event.title}</h3>
                <p className="text-[#6b7a99] text-sm mb-2 text-[#4db9e5]">{event.brief_description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className='text-[#4db9e5]'>{new Date(event.start_date).toLocaleDateString('pt-BR')}</span>
                    <span className='bg-[#fff999] px-1 py-1 rounded text-[#170666]'>por {event.profiles?.username}</span>
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
        <div className="min-h-screen bg-gradient-to-r from-[rgb(33,66,99)] to-[rgb(0,99,99)]">
        
        {/* Cabeçalho */}
        <header className="bg-gradient-to-r from-[rgb(0,99,99)] to-[rgb(33,66,99)] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#170666]">Eventos</h1>
            
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
