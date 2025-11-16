import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { signIn, loading } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos')
      return
    }

    const result = await signIn(email, password)

    if (!result.success) {
      setErrorMessage('Email ou senha incorretos')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 shadow-lg">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              Dashboard de Ocorrências
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-50"
                placeholder="seu@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-50"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Mensagem de erro */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-neutral-900 dark:bg-neutral-700 text-white font-medium rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-6">
          Sistema de Gestão de Ocorrências de Ponto
        </p>
      </div>
    </div>
  )
}

export default LoginPage
