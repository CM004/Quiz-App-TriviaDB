import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Quiz from './pages/Quiz.jsx'
import Results from './pages/Results.jsx'

function App() {
  const location = useLocation()
  const isResultsPage = location.pathname === '/results'

  return (
    <div className="app-container">
      <header className="app-header">
        <Link to={isResultsPage ? "/quiz?restart=true" : "/quiz"} className="brand">Quiz App</Link>
        <nav>
          <Link to="/results" className="brand">Results</Link>
          {isResultsPage && <Link to="/quiz" className="brand">Restart Quiz</Link>}
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/quiz" replace />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/quiz" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
