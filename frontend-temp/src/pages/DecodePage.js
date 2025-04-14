// pages/DecodePage.js
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const DecodePage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    maxFiles: 1,
    onDrop: acceptedFiles => setFile(acceptedFiles[0])
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
      setError('');
    } catch (err) {
      setError('Error decoding image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
  <div className="result-card">
    <h2>Decode Hidden Message</h2>
    <div 
      className="dropzone"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {file ? (
        <p>Selected file: {file.name}</p>
      ) : isDragActive ? (
        <p>Drop the image here...</p>
      ) : (
        <p>Drag stego image here</p>
      )}
    </div>

    {error && <div className="error-message">{error}</div>}

    <button 
      className="btn btn-primary"
      onClick={handleSubmit}
      disabled={loading}
    >
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        'Decode Message'
      )}
    </button>

    {message && (
      <div className="decoded-message">
        <h3>Hidden Message:</h3>
        <p>{message}</p>
      </div>
    )}
  </div>
</div>

  );
};

export default DecodePage;
