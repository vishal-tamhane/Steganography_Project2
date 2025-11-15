import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import '../App.css';

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-container">
        {/* Project Info */}
        <div className="footer-section">
          <h2 className="footer-title">Steganography</h2>
          <p className="footer-tagline">Hide your secrets in plain sight.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/encode">Encode</a></li>
            <li><a href="/decode">Decode</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h3>Contact</h3>
          <ul className="footer-contact-list">
          <li>
              <FaPhoneAlt className="footer-icon" />
              <a href="tel:9699842565">+91 9699842565</a>
            </li>
            <li>
              <FaEnvelope className="footer-icon" />
              <a href="mailto:your.email@example.com">vishaltamhane04@gmail.com</a>
            </li>
            
            <li>
              <FaMapMarkerAlt className="footer-icon" />
              <span>Pimpri-Chinchwad, Pune, India</span>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="footer-socials">
            <a href="https://github.com/vishal-tamhane" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="https://www.linkedin.com/in/vishal-tamhane/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Steganography Project. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
