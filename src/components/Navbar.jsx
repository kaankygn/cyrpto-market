import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="flex items-center gap-6 border-b border-gray-200 px-8 py-4">
      <span className="text-lg font-bold text-emerald-600">CryptoMarket</span>
      <Link to="/" className="text-gray-600 hover:text-emerald-600">Dashboard</Link>
      <Link to="/markets" className="text-gray-600 hover:text-emerald-600">Markets</Link>
    </nav>
  );
}

export default Navbar;