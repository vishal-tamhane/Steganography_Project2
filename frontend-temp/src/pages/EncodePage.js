// pages/EncodePage.js
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FiUploadCloud, FiLock, FiImage } from 'react-icons/fi';
import '../App.css';

const EncodePage = () => {
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
      setSuccess(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !message) {
      setError('Please select an image and enter a message');
      setSuccess(false);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('message', message);

    try {
      const response = await axios.post('http://localhost:3001/encode', formData, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'encoded_image.png');
      document.body.appendChild(link);
      link.click();
      setError('');
      setSuccess(true);
      setMessage('');
      setFile(null);
    } catch (err) {
      setError('Error encoding image. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encode-container">
      <div className="glass-card">
        <h1 className="encode-title">
          <FiLock className="title-icon" />
          Hide Your Secret Message
        </h1>

        <form onSubmit={handleSubmit}>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${success ? 'success' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <FiUploadCloud className="upload-icon" />
              {file ? (
                <div className="file-preview">
                  <FiImage className="file-img-icon" />
                  <p className="file-name">{file.name}</p>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ) : (
                <p className="drop-text">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Drag & drop image, or click to select'}
                </p>
              )}
            </div>
          </div>

          <textarea
            className="message-input"
            placeholder="Enter your secret message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
          />

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && (
            <div className="success-message">
              🎉 Encoded image downloaded successfully!
            </div>
          )}

          <button
            className="encode-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <FiLock className="button-icon" />
                Encode Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EncodePage;
