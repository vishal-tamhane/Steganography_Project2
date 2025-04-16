import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Steganography App
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/encode" className="nav-link">
                Encode
              </Link>
              <Link to="/decode" className="nav-link">
                Decode
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login/Signup
            </Link>
          )}
          <Link to="/about" className="nav-link">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
