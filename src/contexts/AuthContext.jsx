import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verifica se há uma sessão ativa ao carregar
    checkUser()

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    } catch (err) {
      console.error('Erro ao verificar sessão:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    try {
      setError(null)
      setLoading(true)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      setUser(data.user)
      return { success: true }
    } catch (err) {
      console.error('Erro ao fazer login:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
      setError(err.message)
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
