import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Steganography App
        </Link>
        
        <button 
          className={`menu-button ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/encode" className="nav-link" onClick={() => setIsMenuOpen(false)}>Encode</Link>
          <Link to="/decode" className="nav-link" onClick={() => setIsMenuOpen(false)}>Decode</Link>
          {user ? (
            <button className="logout-btn" onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 