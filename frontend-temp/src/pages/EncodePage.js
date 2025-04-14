// pages/EncodePage.js
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const EncodePage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    maxFiles: 1,
    onDrop: acceptedFiles => setFile(acceptedFiles[0])
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !message) {
      setError('Please select an image and enter a message');
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
    } catch (err) {
      setError('Error encoding image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
  <div className="result-card">
    <h2>Encode Your Message</h2>
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
        <p>Drag image here or click to select</p>
      )}
    </div>

    <textarea
      className="message-input"
      placeholder="Enter your secret message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />

    {error && <div className="error-message">{error}</div>}

    <button 
      className="btn btn-primary"
      onClick={handleSubmit}
      disabled={loading}
    >
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        'Encode Message'
      )}
    </button>
  </div>
</div>

  );
};

export default EncodePage;
