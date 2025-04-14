import React from 'react';
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
      </div>
    </div>
  );
};

export default HomePage;
