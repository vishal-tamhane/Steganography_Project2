import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Navbar = () => {
  return (
    <nav className="custom-navbar">
      <div className="nav-section nav-left">
        <Link to="/encode" className="nav-link">Encode</Link>
        <Link to="/decode" className="nav-link">Decode</Link>
      </div>
      <div className="nav-center">
        <Link to="/" className="nav-title">Steganography</Link>
      </div>
      <div className="nav-section nav-right">
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/login" className="nav-link">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
