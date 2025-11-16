import { ThemeProvider } from './contexts/ThemeContext'
import { FilterProvider } from './contexts/FilterContext'
import { DataProvider, useData } from './contexts/DataContext'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

function AppContent() {
  const { loading } = useData()

  if (loading) {
    return <LoadingScreen />
  }

  return <Layout />
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <FilterProvider>
          <AppContent />
        </FilterProvider>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App
