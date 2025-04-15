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

        {/* How to Use Section */}
        <section className="how-to-use-section">
          <h2>How to Use</h2>
          <ol className="how-to-list">
            <li>
              <strong>1. Encode:</strong> Click <a href="/encode">Get Started</a>, upload your image, type your secret message, and download the encoded image.
            </li>
            <li>
              <strong>2. Share:</strong> Send the encoded image to your recipient via email, chat, or any platform.
            </li>
            <li>
              <strong>3. Decode:</strong> The recipient uploads the image on the <a href="/decode">Decode</a> page to reveal the hidden message.
            </li>
          </ol>
        </section>

        {/* Why Steganography Section */}
        <section className="why-steg-section">
          <h2>Why Steganography?</h2>
          <ul>
            <li><strong>Privacy:</strong> Hide messages in plain sight, not just with encryption.</li>
            <li><strong>Security:</strong> Double protection—encryption + steganography.</li>
            <li><strong>Easy Sharing:</strong> Use any image, share on any platform, and only the intended recipient can decode.</li>
            <li><strong>Modern Technology:</strong> Uses advanced algorithms for maximum stealth and safety.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
