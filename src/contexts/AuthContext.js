'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'User:', session?.user?.id)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, username) => {
    try {
      console.log('1. Tentando criar usuário:', email)
      
      // 1. Criar usuário no auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      })

      console.log('2. Resposta do signUp:', { 
        userId: data?.user?.id, 
        error: error?.message 
      })

      if (error) {
        console.error('Erro no auth.signUp:', error)
        throw error
      }

      // 2. Criar perfil (só se o usuário foi criado)
      if (data.user) {
        console.log('3. Tentando criar perfil para:', data.user.id)
        
        const profileData = {
          id: data.user.id,
          username: username,
          full_name: username
        }
        
        console.log('4. Dados do perfil:', profileData)
        
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()

        console.log('5. Resposta do insert profile:', { 
          profileResult, 
          profileError 
        })

        if (profileError) {
          console.error('ERRO DETALHADO ao criar perfil:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          })
        } else {
          console.log('6. Perfil criado com sucesso!')
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('ERRO GERAL no signUp:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) {
      console.error('Erro no signIn:', error)
    } else {
      console.log('Login bem-sucedido:', data.user?.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)