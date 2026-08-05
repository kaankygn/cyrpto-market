import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import CoinDetail from './pages/CoinDetail'

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/coin/:symbol" element={<CoinDetail />} />
      </Routes>
    </div>
  );
}

export default App;