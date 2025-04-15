import React from 'react';
import { FaLock, FaImage, FaUserSecret, FaGithub, FaReact, FaNodeJs, FaPython, FaEnvelope } from 'react-icons/fa';
import '../App.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About <span className="about-highlight">Steganography</span> Project</h1>
        <p>
          <FaUserSecret className="about-icon" />
          <span>
            Steganography is the art of hiding information in plain sight. Our project lets you securely embed secret messages inside images, combining advanced cryptography and modern web technology for privacy and ease of use.
          </span>
        </p>
      </div>

      <div className="about-section about-features-section">
        <h2>Key Features</h2>
        <div className="about-features-grid">
          <div className="about-feature-card">
            <FaLock className="about-feature-icon" />
            <strong>Military-Grade Encryption</strong>
            <p>AES-256 & RSA-2048 encryption for maximum security</p>
          </div>
          <div className="about-feature-card">
            <FaImage className="about-feature-icon" />
            <strong>Advanced Steganography</strong>
            <p>LSB-based image steganography with chaotic mapping</p>
          </div>
          <div className="about-feature-card">
            <FaUserSecret className="about-feature-icon" />
            <strong>User-Friendly</strong>
            <p>Simple, intuitive interface for encoding and decoding</p>
          </div>
          <div className="about-feature-card">
            <FaGithub className="about-feature-icon" />
            <strong>Open Source</strong>
            <p>Open source and privacy-focused</p>
          </div>
        </div>
      </div>

      <div className="about-section about-tech-section">
        <h2>Technology Stack</h2>
        <div className="about-tech-stack">
          <span><FaReact className="about-tech-icon" /> React</span>
          <span><FaNodeJs className="about-tech-icon" /> Node.js</span>
          <span><FaPython className="about-tech-icon" /> Python</span>
        </div>
        <p>
          The frontend is built with React for a fast, responsive user experience. The backend uses Node.js and Python for robust API and steganography processing.
        </p>
      </div>

      <div className="about-section about-team-section">
        <h2>Meet the Team</h2>
        <div className="about-team">
          <div className="about-team-member">
            <img src="https://i.pravatar.cc/100?img=1" alt="Team Member" />
            <div>
              <strong>Vishal T.</strong>
              <p>Lead Developer & Security Enthusiast</p>
            </div>
          </div>
          {/* Add more team members as needed */}
        </div>
      </div>

      <div className="about-section about-contact">
        <h2>Contact & Links</h2>
        <div className="about-contact-info">
          <p>
            <FaEnvelope className="about-contact-icon" />
            Email: <a href="mailto:your.email@example.com">your.email@example.com</a>
          </p>
          <p>
            <FaGithub className="about-contact-icon" />
            GitHub: <a href="https://github.com/yourprofile" target="_blank" rel="noopener noreferrer">github.com/yourprofile</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
