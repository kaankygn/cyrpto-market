import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import CoinDetail from './pages/CoinDetail'
import Ticker from './components/Ticker'

function App() {
  return (
    <div>
      <Navbar />
      <Ticker />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/coin/:symbol" element={<CoinDetail />} />
      </Routes>
    </div>
  );
}

export default App;