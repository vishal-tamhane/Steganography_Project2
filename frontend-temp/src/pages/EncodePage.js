// pages/EncodePage.js
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
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
      const response = await fetch('http://localhost:3001/encode', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Encoding failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encoded_image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Message encoded successfully!');
      setFile(null);
      setMessage('');
      setSecretKey('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encode-container">
      <div className="glass-card">
        <h2 className="encode-title">Encode Message</h2>
        <form onSubmit={handleSubmit}>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'success' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              {file ? (
                <div className="file-preview">
                  <i className="file-img-icon">📷</i>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <>
                  <i className="upload-icon">📁</i>
                  <p className="drop-text">
                    {isDragActive
                      ? 'Drop the image here'
                      : 'Drag & drop an image here, or click to select'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="message-input-container">
            <label htmlFor="message">Message to Encode:</label>
            <textarea
              id="message"
              className="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your secret message here..."
              required
            />
          </div>

          <div className="secret-key-container">
            <label htmlFor="secretKey">Secret Key (min 8 characters):</label>
            <input
              id="secretKey"
              type="password"
              className="secret-key-input"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              minLength="8"
              required
            />
            {secretKey.length > 0 && secretKey.length < 8 && (
              <span className="error-message">Key must be at least 8 characters</span>
            )}
          </div>

          <button
            type="submit"
            className="encode-button"
            disabled={loading || !file || !message.trim() || secretKey.length < 8}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Encoding...
              </>
            ) : (
              'Encode Message'
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default EncodePage;
