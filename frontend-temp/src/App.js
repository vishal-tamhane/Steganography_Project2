// App.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EncodePage from './pages/EncodePage';
import DecodePage from './pages/DecodePage';
import HomePage from './pages/HomePage';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import './App.css';
function App() {
  return (
    <Router>
       <Navbar />

      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/encode" element={<EncodePage />} />
          <Route path="/decode" element={<DecodePage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
