

'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

export default function EventDetail({ params }) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  
  const { user } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [enrollmentStatus, setEnrollmentStatus] = useState(null)

  useEffect(() => {
    loadEventDetails()
    if (user) {
      checkEnrollmentStatus()
    }
  }, [eventId, user])

  const loadEventDetails = async () => {
    try {
      // const { id } = await params
      // const response = await fetch(`/api/events/${id}`)
      const response = await fetch(`/api/events/${eventId}`)
      
      if (!response.ok) {
        throw new Error('Evento não encontrado')
      }

      const data = await response.json()
      setEvent(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollmentStatus = async () => {
    try {
      // const { id } = await params
      // const response = await fetch(`/api/enrollments/check/${id}`)
      const response = await fetch(`/api/enrollments/check/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollmentStatus(data.status)
      }
    } catch (err) {
      console.error('Erro ao verificar inscrição:', err)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setEnrolling(true)
    setError('')

    try {
      // const { id } = await params
      /* const response = await fetch(`/api/events/${id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      }) */

      const response = await fetch(`/api/events/${eventId}/enroll`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao se inscrever')
      }

      alert('Inscrição realizada com sucesso!')
      checkEnrollmentStatus()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando evento...</p>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Voltar para home</Link>
        </div>
      </div>
    )
  }

  const isOrganizer = user?.id === event?.organizer_id
  const canEnroll = event?.status === 'open' && event?.is_published && !isOrganizer
  const isFull = event?.capacity && event?.enrolled_count >= event?.capacity

  return (
    <div className="min-h-screen bg-gradient-to-r from-[rgb(33,66,99)] to-[rgb(33,33,33)]">
      {/* Header */}
      <header className="bg-[#bec8cd] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-[#170666] hover:text-white">← Voltar</Link>
          {user && (<Link href="/dashboard" className="bg-[#6b7a99] text-[#bec8cd] hover:text-gray-900 py-2 px-2 rounded">Meu Painel</Link>)}
        </div>
      </header>

      {/* Banner */}
      {/* <div className="h-64 bg-gradient-to-r from-[rgb(22,55,88)] to-[rgb(0,99,99)] relative">
        {event?.banner_url && (
          <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover"/>
        )}
      </div> */}

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-[#bec8cd] rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{event?.title}</h1>
                  <p className="text-gray-600">{event?.brief_description}</p>
                </div>
                {event?.category && (
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                )}
              </div>

              {/* Status do Evento */}
              <div className="flex gap-2 mb-4">
                {event?.is_published ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Publicado</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Não Publicado</span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${
                  event?.status === 'open' ? 'bg-green-100 text-green-800' :
                  event?.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {event?.status === 'open' ? 'Aberto' : 
                   event?.status === 'closed' ? 'Fechado' : 'Em Andamento'}
                </span>
              </div>

              {/* Descrição Completa */}
              <div className="border-t pt-4">
                <h2 className="text-xl font-semibold mb-3">Sobre o Evento</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {event?.full_description || event?.brief_description}
                </p>
              </div>
            </div>

            {/* Organizador */}
            <div className="bg-[#bec8cd] rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">Organizador</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {event?.profiles?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  {/* <p className="font-medium">{event?.profiles?.username}</p> */}
                  {event?.profiles?.full_name && (
                    <p className="text-sm text-gray-600">{event.profiles.full_name}</p>
                  )}
                  {event?.profiles?.rating !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span className='text-[#170666]'>{Number(event.profiles.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Lateral - Card de Inscrição */}
          <div className="lg:col-span-1">
            <div className="bg-[#bec8cd] rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Informações</h2>
              
              {/* Data e Hora */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Início</p>
                    <p className="font-medium">
                      {new Date(event?.start_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Término</p>
                    <p className="font-medium">
                      {new Date(event?.end_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Local */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Local</p>
                    <p className="font-medium">{event?.location}</p>
                  </div>
                </div>

                {/* Capacidade */}
                {event?.capacity && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Vagas</p>
                      <p className="font-medium">
                        {event.capacity - (event.enrolled_count || 0)} disponíveis
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Inscrição */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {isOrganizer ? (
                <Link href={`/events/${event?.id}/manage`} 
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center block"
                >Gerenciar Evento</Link>
              ) : enrollmentStatus === 'approved' ? (
                <div className="text-center">
                  <div className="bg-green-50 text-green-700 py-3 rounded-lg mb-2 font-medium">✓ Você está inscrito</div>
                  <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800"
                  >Ver minha inscrição</Link>
                </div>
              ) : enrollmentStatus === 'pending' ? (
                <div className="bg-yellow-50 text-yellow-700 py-3 rounded-lg text-center font-medium">⏳ Inscrição Pendente</div>
              ) : canEnroll ? (
                isFull ? (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                  >
                    Evento Lotado
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                  >
                    {enrolling ? 'Inscrevendo...' : 'Inscrever-se'}
                  </button>
                )
              ) : (
                <button disabled
                  className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  {event?.status === 'closed' ? 'Inscrições Fechadas' : 'Inscrições Indisponíveis'}
                </button>
              )}

              {!user && (
                <p className="text-sm text-gray-600 text-center mt-3">
                  <Link href="/login" className="text-blue-600 hover:text-blue-800">Faça login</Link>
                  {' '}para se inscrever
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
