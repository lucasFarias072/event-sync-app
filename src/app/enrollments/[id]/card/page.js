'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function EnrollmentCard({ params }) {
  const resolvedParams = use(params)
  const enrollmentId = resolvedParams.id
  
  const { user } = useAuth()
  const router = useRouter()
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      loadEnrollment()
    }
  }, [user, enrollmentId])

  const loadEnrollment = async () => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`)
      
      if (!response.ok) {
        throw new Error('Inscrição não encontrada')
      }

      const data = await response.json()
      
      // Verificar se a inscrição pertence ao usuário
      if (data.participant_id !== user.id) {
        throw new Error('Você não tem permissão para ver este cartão')
      }

      setEnrollment(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Carregando cartão...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    )
  }

  const event = enrollment?.events
  const qrCodeData = JSON.stringify({
    enrollmentId: enrollment.id,
    eventId: enrollment.event_id,
    participantId: enrollment.participant_id
  })

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#3b3c49] to-[#6b7a99] py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Botão Voltar */}
        <Link 
          href="/dashboard" 
          className="inline-block mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Voltar ao painel
        </Link>

        {/* Cartão Virtual */}
        <div className="bg-[#3b3c49] rounded-2xl shadow-xl overflow-hidden">
          {/* Header do Cartão */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Cartão de Participante</h1>
            <p className="text-blue-100">EventSync</p>
          </div>

          {/* Conteúdo do Cartão */}
          <div className="p-6">
            {/* Informações do Participante */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Participante</h2>
              <p className="text-gray-800 font-medium">
                {enrollment.profiles?.username || enrollment.profiles?.full_name || 'Usuário'}
              </p>
              <p className="text-sm text-[#b4ae98]">{user.email}</p>
            </div>

            {/* Informações do Evento */}
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-lg font-semibold mb-2">Evento</h2>
              <h3 className="text-[#4db9e5] font-medium mb-1">{event?.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-[#b4ae98]">Data:</span>
                  {' '}
                  <span className='text-[rgb(242,242,242)]'>
                    {new Date(event?.start_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-[#b4ae98]">Horário:</span>
                  {' '}
                  <span className='text-[rgb(242,242,242)]'>
                    {new Date(event?.start_date).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-[#b4ae98]">Local:</span> 
                  {' '}
                  <span className='text-[rgb(242,242,242)]'>
                      {event?.location}
                  </span>
                </p>
              </div>
            </div>

            {/* Status da Inscrição */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  enrollment.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {enrollment.status === 'approved' ? 'Aprovado' : 'Pendente'}
                </span>
              </div>
              {enrollment.checked_in && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Check-in:</span>
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Realizado
                  </span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                QR Code para Check-in
              </h3>
              <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                <QRCodeCanvas 
                  value={qrCodeData}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Apresente este QR Code ao organizador para fazer check-in
              </p>
            </div>

            {/* ID da Inscrição */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                ID: {enrollment.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-6 bg-[#3b3c49] rounded-lg p-4">
          <h3 className="font-medium mb-2 text-[rgb(242,242,242)]">Instruções</h3>
          <ul className="text-sm space-y-1 text-[#b4ae98]">
            <li>• Guarde este cartão para apresentar no evento</li>
            <li>• O QR Code é único e válido apenas para você</li>
            <li>• Você pode acessar este cartão a qualquer momento pelo painel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}