import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import CoinDetail from './pages/CoinDetail'
import Ticker from './components/Ticker'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <div>
      <Navbar />
      <Ticker />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/coin/:symbol" element={<CoinDetail />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;