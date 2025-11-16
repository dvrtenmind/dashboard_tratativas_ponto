import { ThemeProvider } from './contexts/ThemeContext'
import { FilterProvider } from './contexts/FilterContext'
import Layout from './components/Layout'

function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <Layout />
      </FilterProvider>
    </ThemeProvider>
  )
}

export default App
