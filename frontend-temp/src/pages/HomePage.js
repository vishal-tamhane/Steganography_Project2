import React from 'react';
import { FaUserSecret, FaShieldAlt, FaShareAlt, FaCogs, FaLock, FaImage, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../App.css';

const HomePage = () => {
  return (
    <div>
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Secure Image Steganography
          </motion.h1>
          <motion.p 
            className="subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Hide & Reveal Secret Messages in Images
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="/encode" className="btn btn-primary">
              <FaImage className="mr-2" /> Get Started
            </a>
            <a href="/decode" className="btn btn-secondary">
              <FaKey className="mr-2" /> Learn More
            </a>
          </motion.div>
        </div>
      </motion.section>

      <div className="container">
        <motion.div 
          className="features-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaLock className="feature-icon" size={40} />
            <h3>Military-Grade Encryption</h3>
            <p>AES-256 + RSA-2048 protected messages</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaUserSecret className="feature-icon" size={40} />
            <h3>Advanced Steganography</h3>
            <p>LSB with chaotic bit distribution</p>
          </motion.div>
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <FaShieldAlt className="feature-icon" size={40} />
            <h3>Secure Cloud Storage</h3>
            <p>Encrypted image hosting available</p>
          </motion.div>
        </motion.div>

        <motion.section 
          className="how-to-use-notebook"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h2>How to Use</h2>
          <div className="how-to-steps-wrapper">
            <motion.div 
              className="how-to-step"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="how-to-img">
                <FaImage size={40} />
              </div>
              <div className="how-to-desc">
                <strong>Encode</strong>
                <p>Upload your image, type your secret message, and download the encoded image.</p>
              </div>
            </motion.div>
            <motion.div 
              className="how-to-step"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="how-to-img">
                <FaShareAlt size={40} />
              </div>
              <div className="how-to-desc">
                <strong>Share</strong>
                <p>Send the encoded image to your recipient via email, chat, or any platform.</p>
              </div>
            </motion.div>
            <motion.div 
              className="how-to-step"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="how-to-img">
                <FaKey size={40} />
              </div>
              <div className="how-to-desc">
                <strong>Decode</strong>
                <p>Recipient uploads the image to reveal the hidden message.</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section 
          className="why-steg-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2>Why Steganography?</h2>
          <div className="why-steg-grid">
            <motion.div 
              className="why-steg-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaUserSecret className="why-steg-icon" />
              <strong>Privacy</strong>
              <p>Hide messages in plain sight, not just with encryption.</p>
            </motion.div>
            <motion.div 
              className="why-steg-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaShieldAlt className="why-steg-icon" />
              <strong>Security</strong>
              <p>Double protection—encryption + steganography.</p>
            </motion.div>
            <motion.div 
              className="why-steg-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaShareAlt className="why-steg-icon" />
              <strong>Easy Sharing</strong>
              <p>Use any image, share on any platform, and only the intended recipient can decode.</p>
            </motion.div>
            <motion.div 
              className="why-steg-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaCogs className="why-steg-icon" />
              <strong>Modern Technology</strong>
              <p>Uses advanced algorithms for maximum stealth and safety.</p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default HomePage;
