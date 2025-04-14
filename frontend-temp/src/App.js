// App.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EncodePage from './pages/EncodePage';
import DecodePage from './pages/DecodePage';
import HomePage from './pages/HomePage';
import './App.css';
function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-xl font-bold">StegoApp</Link>
          <div className="space-x-4">
            <Link to="/encode" className="text-gray-300 hover:text-white">Encode</Link>
            <Link to="/decode" className="text-gray-300 hover:text-white">Decode</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/encode" element={<EncodePage />} />
          <Route path="/decode" element={<DecodePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
