import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FiUploadCloud, FiLock, FiUnlock, FiCopy } from 'react-icons/fi';
import '../App.css';

const DecodePage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': ['.png', '.jpg', '.jpeg']},
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setError('');
    }
  });

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:3001/decode', formData);
      setMessage(response.data.message);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error decoding image. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="decode-container">
      <div className="glass-card">
        <h1 className="decode-title">
          <FiUnlock className="title-icon" />
          Reveal Hidden Secrets
        </h1>

        <div 
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${success ? 'success' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <FiUploadCloud className="upload-icon" />
            {file ? (
              <div className="file-preview">
                <p className="file-name">{file.name}</p>
                <span className="file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ) : (
              <p className="drop-text">
                {isDragActive 
                  ? 'Drop the stego image here' 
                  : 'Drag & drop image, or click to select'}
              </p>
            )}
          </div>
        </div>

        <div className="action-section">
          <button 
            onClick={handleSubmit}
            disabled={loading || !file}
            className="decode-button"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <FiLock className="button-icon" />
                Decode Message
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {message && (
          <div className="message-result">
            <div className="message-header">
              <h3>Decrypted Message</h3>
              <button 
                onClick={copyToClipboard}
                className="copy-button"
                title="Copy to clipboard"
              >
                <FiCopy />
              </button>
            </div>
            <div className="message-content">
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecodePage;
