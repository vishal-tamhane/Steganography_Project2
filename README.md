# Steganography Web Application

A secure web-based steganography application that allows users to hide encrypted messages within PNG images using LSB (Least Significant Bit) steganography and AES-256-GCM encryption.

## 🚀 Features

- **Secure Message Hiding**: Hide encrypted messages within PNG images using LSB steganography
- **AES-256-GCM Encryption**: Military-grade encryption for message security
- **User Authentication**: JWT-based authentication system with user registration and login
- **Web Interface**: Modern, responsive web interface for easy interaction
- **Rate Limiting**: Protection against brute force attacks
- **File Validation**: Comprehensive input validation and error handling
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🛠️ Technology Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Python** - Steganography processing
- **PostgreSQL** - User database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Sharp** - Image processing

### Frontend
- **HTML5/CSS3** - User interface
- **JavaScript** - Client-side functionality
- **Bootstrap** - Responsive design

### Security
- **AES-256-GCM** - Message encryption
- **PBKDF2** - Password-based key derivation
- **bcrypt** - Password hashing
- **Rate Limiting** - API protection

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **Python** (v3.7 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Steganography_Project2
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
cd backend
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Database Setup

Create a PostgreSQL database and update the connection details in `backend/db.js`:

```javascript
const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'steganography_db',
    password: 'your_password',
    port: 5432,
});
```

Create the users table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
JWT_SECRET=your_jwt_secret_key_here
DB_USER=your_db_username
DB_HOST=localhost
DB_NAME=steganography_db
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### 5. Create Uploads Directory

```bash
mkdir backend/uploads
```

## 🚀 Running the Application

### Start the Backend Server

```bash
cd backend
node server.js
```

The server will start on `http://localhost:3001`

### Access the Web Interface

Open `index.html` in your web browser or serve it using a local server.

## 📖 Usage

### 1. User Registration/Login

1. Register a new account or login with existing credentials
2. The system will provide a JWT token for authentication

### 2. Encoding (Hiding Messages)

1. **Upload Image**: Select a PNG image file
2. **Enter Message**: Type the message you want to hide
3. **Set Secret Key**: Create a strong password (minimum 8 characters)
4. **Encode**: Click the encode button
5. **Download**: The encoded image will be automatically downloaded

### 3. Decoding (Extracting Messages)

1. **Upload Encoded Image**: Select the image containing the hidden message
2. **Enter Secret Key**: Provide the same password used during encoding
3. **Decode**: Click the decode button
4. **View Message**: The hidden message will be displayed

## 🔒 Security Features

### Encryption
- **AES-256-GCM**: Provides both confidentiality and authenticity
- **PBKDF2**: Key derivation with 100,000 iterations
- **Random Salt**: Unique salt for each encryption
- **Authentication Tag**: Prevents tampering

### Authentication
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: Prevents brute force attacks

### Input Validation
- **File Type Checking**: Only PNG images accepted
- **Message Size Limits**: Prevents oversized messages
- **Password Requirements**: Minimum 8 characters
- **Path Sanitization**: Prevents directory traversal

## 🧪 Testing

### Run Python Script Tests

```bash
cd backend
python test_steg.py
python test_complex.py
```

### Run Server Integration Tests

```bash
cd backend
node test_server.js
```

## 📁 Project Structure

```
Steganography_Project2/
├── backend/
│   ├── server.js              # Main server file
│   ├── steg.py                # Steganography encoder
│   ├── decode_Steg0.py        # Steganography decoder
│   ├── auth.js                # Authentication utilities
│   ├── db.js                  # Database connection
│   ├── test_steg.py           # Python script tests
│   ├── test_complex.py        # Complex message tests
│   ├── test_server.js         # Server integration tests
│   ├── uploads/               # Temporary file storage
│   ├── package.json           # Node.js dependencies
│   └── requirements.txt       # Python dependencies
├── index.html                 # Web interface
└── README.md                  # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### Steganography
- `POST /encode` - Hide message in image
- `POST /decode` - Extract message from image

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

## 🐛 Troubleshooting

### Common Issues

1. **"Encoding failed" Error**
   - Ensure the input image is a PNG file
   - Check that the message isn't too large for the image
   - Verify the secret key is at least 8 characters

2. **"Decoding failed" Error**
   - Make sure you're using the correct secret key
   - Verify the image was properly encoded
   - Check that the image file isn't corrupted

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure the database and table exist

4. **Python Script Errors**
   - Verify Python dependencies are installed
   - Check Python version (3.7+ required)
   - Ensure all required libraries are available

### Debug Mode

Enable detailed logging by setting the environment variable:

```bash
DEBUG=true node server.js
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the test files for usage examples

## 🔄 Version History

- **v1.0.0** - Initial release with basic steganography functionality
- **v1.1.0** - Added user authentication and web interface
- **v1.2.0** - Enhanced security and error handling
- **v1.3.0** - Fixed server integration issues and improved testing

---

**Note**: This application is for educational and legitimate use only. Users are responsible for complying with applicable laws and regulations regarding the use of steganography and encryption technologies.

