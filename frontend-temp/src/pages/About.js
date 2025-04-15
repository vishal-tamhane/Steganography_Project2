import React from 'react';
import { FaLock, FaImage, FaUserSecret, FaGithub, FaReact, FaNodeJs, FaPython } from 'react-icons/fa';
import '../App.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Steganography Project</h1>
        <p>
          <FaUserSecret className="about-icon" />
          <span>
            Steganography is the art of hiding information in plain sight. Our project lets you securely embed secret messages inside images, combining advanced cryptography and modern web technology for privacy and ease of use.
          </span>
        </p>
      </div>

      <div className="about-section">
        <h2>Key Features</h2>
        <ul className="about-features">
          <li><FaLock className="about-feature-icon" /> AES-256 & RSA-2048 encryption for maximum security</li>
          <li><FaImage className="about-feature-icon" /> LSB-based image steganography with chaotic mapping</li>
          <li><FaUserSecret className="about-feature-icon" /> Simple, intuitive interface for encoding and decoding</li>
          <li><FaGithub className="about-feature-icon" /> Open source and privacy-focused</li>
        </ul>
      </div>

      <div className="about-section">
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
        <p>
          Have questions or want to contribute? <br />
          Email: <a href="mailto:your.email@example.com">your.email@example.com</a> <br />
          GitHub: <a href="https://github.com/yourprofile" target="_blank" rel="noopener noreferrer">github.com/yourprofile</a>
        </p>
      </div>
    </div>
  );
};

export default About;
