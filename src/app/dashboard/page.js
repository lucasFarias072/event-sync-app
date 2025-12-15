'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [myEvents, setMyEvents] = useState([])
  const [myEnrollments, setMyEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      loadDashboardData()
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    setLoading(true)
    await Promise.all([
      loadMyEvents(),
      loadMyEnrollments()
    ])
    setLoading(false)
  }

  const loadMyEvents = async () => {
    try {
      const response = await fetch(`/api/events/organizer/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setMyEvents(data)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    }
  }

  const loadMyEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments/my-enrollments')
      if (response.ok) {
        const data = await response.json()
        setMyEnrollments(data)
      }
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error)
    }
  }

  const handlePublish = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: true })
      })

      if (response.ok) {
        alert('Evento publicado!')
        loadMyEvents()
      }
    } catch (error) {
      alert('Erro ao publicar evento')
    }
  }

  const handleDelete = async (eventId) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Evento deletado!')
        loadMyEvents()
      }
    } catch (error) {
      alert('Erro ao deletar evento')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovado' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Recusado' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`text-xs ${badge.bg} ${badge.text} px-2 py-1 rounded`}>
        {badge.label}
      </span>
    )
  }

  const getEventStatus = (event) => {
    const now = new Date()
    const start = new Date(event.start_date)
    const end = new Date(event.end_date)

    if (now < start) return { label: 'Em breve', color: 'text-[#bec8cd]' }
    if (now >= start && now <= end) return { label: 'Em andamento', color: 'text-green-600' }
    return { label: 'Finalizado', color: 'text-gray-600' }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#3b3c49] to-[rgb(0,99,99)]">
      {/* Cabeçalho */}
      <header className="bg-[#3b3c49] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meu Painel</h1>
          <p className="text-sm font-medium text-gray-900 bg-[#bec8cd] py-1 px-1 rounded">{user.user_metadata?.username || 'Usuário'}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900 bg-[#bec8cd] py-1 px-1 rounded">{user.email}</span>
          </p>
          <div className="flex gap-4">
            <Link href="/" className="bg-[#170666] text-[#bec8cd] hover:text-white px-3 py-3 rounded-lg">
              Home
            </Link>
            <button onClick={signOut} className="bg-[#222] text-[rgb(220,20,60)] hover:text-red-800 px-3 py-3 rounded-lg">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Abas de Navegação */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'events'
                ? 'border-b-3 border-[#fff999] text-[#bec8cd]'
                : 'text-[#fff999] hover:text-gray-900'
            }`}
          >
            Meus Eventos ({myEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'enrollments'
                ? 'border-b-3 border-[#fff999] text-[#bec8cd]'
                : 'text-[#fff999] hover:text-gray-900'
            }`}
          >
            Suas Inscrições ({myEnrollments.length})
          </button>
        </div>

        {loading ? (
          <p className="text-center text-[#fff999]">Carregando...</p>
        ) : (
          <>
            {/* Aba: Meus Eventos */}
            {activeTab === 'events' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Meus Eventos</h2>
                  <Link
                    href="/events/create"
                    className="bg-[#4db9e5] text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + Criar Evento
                  </Link>
                </div>

                {myEvents.length === 0 ? (
                  <p className="text-gray-600">Você ainda não criou nenhum evento.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myEvents.map(event => (
                      <div key={event.id} className="bg-[#3b3c49] rounded-lg shadow-md overflow-hidden">
                        <div className="h-16 bg-gradient-to-r from-[#3b3c49] to-[#6b7a99]"></div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg flex-1 text-[#bec8cd]">{event.title}</h3>
                            {event.is_published ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Publicado
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Rascunho
                              </span>
                            )}
                          </div>
                          <p className="text-sm mb-3 text-[#b4ae98]">{event.brief_description}</p>
                          <div className="flex gap-2">
                            <Link
                              href={`/events/${event.id}`}
                              className="bg-[#1e068b] px-3 py-3 rounded-lg text-sm text-[#bec8cd] hover:text-white"
                            >
                              Ver
                            </Link>
                            {!event.is_published && (
                              <button
                                onClick={() => handlePublish(event.id)}
                                className="text-sm text-green-600 hover:text-green-800"
                              >
                                Publicar
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="bg-[#222] text-sm text-[rgb(220,20,60)] hover:text-red-800 py-3 px-3 rounded-lg"
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba: Suas Inscrições */}
            {activeTab === 'enrollments' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Suas Inscrições</h2>

                {myEnrollments.length === 0 ? (
                  <p className="text-gray-600">Você ainda não se inscreveu em nenhum evento.</p>
                ) : (
                  <div className="space-y-4">
                    {myEnrollments.map(enrollment => {
                      const event = enrollment.events
                      const status = getEventStatus(event)
                      
                      return (
                        <div key={enrollment.id} className="bg-[#6b7a99] rounded-lg shadow-md overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            {/* Banner do Evento */}
                            <div className="w-full md:w-16 h-32 md:h-auto bg-gradient-to-r from-[#6b7a99] to-[#bec8cd]" />
                            
                            {/* Informações */}
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg">{event.title}</h3>
                                  <p className="text-sm text-[#222]">{event.brief_description}</p>
                                </div>
                                <div className="flex flex-col gap-1 items-end ml-4">
                                  {getStatusBadge(enrollment.status)}
                                  <span className={`text-xs ${status.color} font-medium`}>
                                    {status.label}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#222] mb-3">
                                <div>
                                  <span className="font-medium">Data:</span>{' '}
                                  {new Date(event.start_date).toLocaleDateString('pt-BR')}
                                </div>
                                <div className='flex items-start gap-2 mb-2'>
                                  <span className="font-medium text-white bg-[#1e068b] py-1 px-1 rounded">Local:</span> 
                                  <span className='text-[#170666] bg-[#bec8cd] py-1 px-1 rounded'>{event.location}</span>
                                </div>
                                
                                {enrollment.checked_in && (
                                  <div className="text-green-600 font-medium">
                                    ✓ Check-in realizado
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Link
                                  href={`/events/${event.id}`}
                                  className="text-sm text-[#bec8cd] hover:text-white font-medium bg-[#170666] rounded px-1 py-1"
                                >
                                  Ver Evento
                                </Link>
                                {enrollment.status === 'approved' && !enrollment.checked_in && (
                                  <Link
                                    href={`/enrollments/${enrollment.id}/card`}
                                    className="bg-[#bec8cd] text-sm text-[#170666] hover:text-white font-medium px-1 py-1 rounded"
                                  >
                                    Ver Cartão Virtual
                                  </Link>
                                )}
                                <div className='px-5 rounded bg-[#4db9e5]'>
                                  <span className="font-medium">por {event.profiles?.username}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}