import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main container com Sidebar e Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar fixa */}
        <Sidebar />

        {/* Main Content */}
        <MainContent />
      </div>
    </div>
  )
}

export default Layout
