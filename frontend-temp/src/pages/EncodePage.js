// pages/EncodePage.js
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaImage, FaLock, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import '../App.css';

const EncodePage = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setError('');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to encode messages');
      return;
    }

    if (!file) {
      setError('Please select an image');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (secretKey.length < 8) {
      setError('Secret key must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('message', message);
    formData.append('secretKey', secretKey);

    try {
      const res = await axios.post(
        'http://localhost:3001/encode',
        formData,
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Download the returned file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'encoded_image.png');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Message encoded successfully!');
      setFile(null);
      setMessage('');
      setSecretKey('');
    } catch (err) {
      setError(err.response?.data?.error || 'Encoding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="encode-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="glass-card"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="encode-title">Encode Message</h2>
        <form onSubmit={handleSubmit}>
          <motion.div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'success' : ''}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              {file ? (
                <motion.div 
                  className="file-preview"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaImage className="file-img-icon" size={40} />
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                </motion.div>
              ) : (
                <>
                  <FaImage className="upload-icon" size={40} />
                  <p className="drop-text">
                    {isDragActive
                      ? 'Drop the image here'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                </>
              )}
            </div>
          </motion.div>

          <motion.div 
            className="message-input-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <label htmlFor="message">Message to Encode:</label>
            <textarea
              id="message"
              className="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your secret message here..."
              required
            />
          </motion.div>

          <motion.div 
            className="secret-key-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <label htmlFor="secretKey">Secret Key (min 8 characters):</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                id="secretKey"
                type="password"
                className="secret-key-input"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                minLength="8"
                required
              />
            </div>
            {secretKey.length > 0 && secretKey.length < 8 && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FaExclamationTriangle className="error-icon" />
                Key must be at least 8 characters
              </motion.span>
            )}
          </motion.div>

          <motion.button
            type="submit"
            className="encode-button"
            disabled={loading || !file || !message.trim() || secretKey.length < 8}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Encoding...
              </>
            ) : (
              'Encode Message'
            )}
          </motion.button>

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaExclamationTriangle className="error-icon" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaCheck className="success-icon" />
              {success}
            </motion.div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EncodePage;
