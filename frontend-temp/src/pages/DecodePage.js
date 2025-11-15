import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaImage, FaKey, FaSpinner, FaExclamationTriangle, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import '../App.css';
// API base (use REACT_APP_API_URL in production)
const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const DecodePage = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setError('');
      setDecodedMessage('');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to decode messages');
      return;
    }

    if (!file) {
      setError('Please select an image');
      return;
    }

    if (!decryptionKey) {
      setError('Please enter the secret key');
      return;
    }

    setLoading(true);
    setError('');
    setDecodedMessage('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('secretKey', decryptionKey);

    try {
      const response = await axios.post(
        `${API}/decode`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setDecodedMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Decoding failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedMessage);
  };

  return (
    <motion.div 
      className="decode-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="glass-card"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="decode-title">Decode Message</h2>
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
            className="secret-key-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <label htmlFor="decryptionKey">Enter Secret Key:</label>
            <div className="input-with-icon">
              <FaKey className="input-icon" />
              <input
                id="decryptionKey"
                type="password"
                className="secret-key-input"
                value={decryptionKey}
                onChange={(e) => setDecryptionKey(e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.button
            type="submit"
            className="decode-button"
            disabled={loading || !file || !decryptionKey}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Decoding...
              </>
            ) : (
              'Decode Message'
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

          {decodedMessage && (
            <motion.div 
              className="message-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="message-header">
                <h3>Decoded Message</h3>
                <motion.button
                  type="button"
                  className="copy-button"
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaCopy />
                </motion.button>
              </div>
              <div className="message-content">{decodedMessage}</div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DecodePage;
