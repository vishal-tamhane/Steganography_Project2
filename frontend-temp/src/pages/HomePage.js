import React from 'react';
import { FaUserSecret, FaShieldAlt, FaShareAlt, FaCogs } from 'react-icons/fa';

import '../App.css';

const HomePage = () => {
  return (
    <div>
      <section className="hero-section">
        <div className="container">
          <h1>Secure Image Steganography</h1>
          <p className="subtitle">Hide & Reveal Secret Messages in Images</p>
          <div className="hero-buttons">
            <a href="/encode" className="btn btn-primary">Get Started</a>
            <a href="/decode" className="btn btn-secondary">Learn More</a>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Military-Grade Encryption</h3>
            <p>AES-256 + RSA-2048 protected messages</p>
          </div>
          <div className="feature-card">
            <h3>Advanced Steganography</h3>
            <p>LSB with chaotic bit distribution</p>
          </div>
          <div className="feature-card">
            <h3>Secure Cloud Storage</h3>
            <p>Encrypted image hosting available</p>
          </div>
        </div>

        {/* How to Use Section */}
        <section className="how-to-use-notebook">
          <h2>How to Use</h2>
          <div className="how-to-steps-wrapper">
            <div className="how-to-step">
              <div className="how-to-img">
                {/* Replace with your own image if desired */}
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#00bcd4" />
                  <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="how-to-desc">
                <strong>Encode</strong>
                <p>Upload your image, type your secret message, and download the encoded image.</p>
              </div>
            </div>
            <div className="how-to-step">
              <div className="how-to-img">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#3949ab" />
                  <path d="M16 8l-8 8M8 8h8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="how-to-desc">
                <strong>Share</strong>
                <p>Send the encoded image to your recipient via email, chat, or any platform.</p>
              </div>
            </div>
            <div className="how-to-step">
              <div className="how-to-img">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#1a237e" />
                  <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="how-to-desc">
                <strong>Decode</strong>
                <p>Recipient uploads the image to reveal the hidden message.</p>
              </div>
            </div>
            {/* Dotted curved line */}
            <svg className="how-to-dotted-line" viewBox="0 0 600 120" width="100%" height="120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="50%" stopColor="#2979ff" />
                  <stop offset="100%" stopColor="#651fff" />
                </linearGradient>
              </defs>
              <path
                d="M0,60 
       C100,10 200,110 300,60 
       S500,10 600,60"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="4"
                strokeDasharray="10,12"
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px #00e5ff)"
              />
            </svg>


          </div>
        </section>


        {/* Why Steganography Section */}
        <section className="why-steg-section">
  <h2>Why Steganography?</h2>
  <div className="why-steg-grid">
    <div className="why-steg-card">
      <FaUserSecret className="why-steg-icon" />
      <strong>Privacy</strong>
      <p>Hide messages in plain sight, not just with encryption.</p>
    </div>
    <div className="why-steg-card">
      <FaShieldAlt className="why-steg-icon" />
      <strong>Security</strong>
      <p>Double protection—encryption + steganography.</p>
    </div>
    <div className="why-steg-card">
      <FaShareAlt className="why-steg-icon" />
      <strong>Easy Sharing</strong>
      <p>Use any image, share on any platform, and only the intended recipient can decode.</p>
    </div>
    <div className="why-steg-card">
      <FaCogs className="why-steg-icon" />
      <strong>Modern Technology</strong>
      <p>Uses advanced algorithms for maximum stealth and safety.</p>
    </div>
  </div>
</section>
      </div>
    </div>
  );
};

export default HomePage;
