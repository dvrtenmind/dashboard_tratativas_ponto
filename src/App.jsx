import { ThemeProvider } from './contexts/ThemeContext'
import { FilterProvider } from './contexts/FilterContext'
import { DataProvider, useData } from './contexts/DataContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import LoginPage from './components/LoginPage'

function AppContent() {
  const { loading: dataLoading } = useData()
  const { isAuthenticated, loading: authLoading } = useAuth()

  // Mostra loading enquanto verifica autenticação ou carrega dados
  if (authLoading || (isAuthenticated && dataLoading)) {
    return <LoadingScreen />
  }

  // Se não estiver autenticado, mostra página de login
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Se autenticado, mostra o dashboard
  return <Layout />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <FilterProvider>
            <AppContent />
          </FilterProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
