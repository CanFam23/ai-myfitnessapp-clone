import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import DailyLogPage from './components/DailyLogPage'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<DailyLogPage />} />
      </Routes>
    </>
  )
}

export default App
