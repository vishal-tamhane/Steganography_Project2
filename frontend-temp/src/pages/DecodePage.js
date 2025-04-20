import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import '../App.css';

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
      const response = await fetch('http://localhost:3001/decode', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Decoding failed');
      }

      const data = await response.json();
      setDecodedMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedMessage);
  };

  return (
    <div className="decode-container">
      <div className="glass-card">
        <h2 className="decode-title">Decode Message</h2>
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

          <div className="secret-key-container">
            <label htmlFor="decryptionKey">Enter Secret Key:</label>
            <input
              id="decryptionKey"
              type="password"
              className="secret-key-input"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="decode-button"
            disabled={loading || !file || !decryptionKey}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Decoding...
              </>
            ) : (
              'Decode Message'
            )}
          </button>

          {error && <div className="error-message">{error}</div>}

          {decodedMessage && (
            <div className="message-result">
              <div className="message-header">
                <h3>Decoded Message</h3>
                <button
                  type="button"
                  className="copy-button"
                  onClick={handleCopy}
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
              <div className="message-content">{decodedMessage}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DecodePage;
