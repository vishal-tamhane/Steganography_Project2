const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const { hashPassword, comparePassword, authenticateToken } = require('./auth');
const sharp = require('sharp');
require('dotenv').config();

const app = express();
const port = 3001;

// Rate limiting for decode endpoint
const decodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many decode attempts. Please try again later.' }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Key derivation function
function deriveKey(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16);
  }
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return { key, salt };
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Authentication endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.rows[0].id, username: newUser.rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: newUser.rows[0] });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.rows[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.rows[0].id, username: user.rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Helper function to run Python scripts with proper error handling
const runPythonScript = (script, options) => new Promise((resolve, reject) => {
    const pyshell = new PythonShell(script, options);
    let output = [];
    let error = null;

    pyshell.on('message', (msg) => {
        console.log('Python output:', msg); // Debug: Log Python output
        output.push(msg);
    });
    pyshell.on('stderr', (stderr) => {
        console.error('Python stderr:', stderr);
        if (stderr.includes('DECRYPT_ERROR')) {
            error = new Error('Invalid secret key');
        } else if (stderr.includes('ENCODE_ERROR')) {
            error = new Error(stderr.split('ENCODE_ERROR:')[1].trim());
        } else if (stderr.includes('ERROR:')) {
            error = new Error(stderr.split('ERROR:')[1].trim());
        } else {
            error = new Error(stderr);
        }
    });
    pyshell.on('error', (err) => {
        console.error('Python error:', err);
        error = err;
    });

    pyshell.end((err) => {
        if (err || error) {
            reject(err || error);
        } else {
            resolve(output);
        }
    });
});
// Helper function to extract cryptographic parameters from image
const extractFromImage = async (imagePath) => {
    const metadata = await sharp(imagePath).metadata();
    const textChunks = metadata.text || {};
    
    if (!textChunks.salt || !textChunks.iv || !textChunks.authTag) {
        throw new Error('Missing crypto parameters in metadata');
    }
    
    return {
        salt: textChunks.salt,
        iv: textChunks.iv,
        authTag: textChunks.authTag
    };
};

// ========== ENCODE ENDPOINT ==========
app.post('/encode', authenticateToken, upload.single('image'), async (req, res) => {
    let sanitizedImagePath;
    let outputPath;
    try {
        if (!req.file || !req.body.message || !req.body.secretKey) {
            return res.status(400).json({ error: 'Image, message, and secret key are required' });
        }

        if (req.body.secretKey.length < 8) {
            return res.status(400).json({ error: 'Secret key must be at least 8 characters' });
        }

        // Validate image format
        const inputMetadata = await sharp(req.file.path).metadata();
        if (inputMetadata.format !== 'png') {
            throw new Error('Input image must be a PNG');
        }

        // Normalize and sanitize file paths
        sanitizedImagePath = path.normalize(req.file.path).replace(/\\/g, '/');
        outputPath = path.join(uploadsDir, `encoded_${Date.now()}.png`);
        const normalizedOutputPath = outputPath.replace(/\\/g, '/');

        // Generate crypto parameters
        const { key, salt } = deriveKey(req.body.secretKey);
        const iv = crypto.randomBytes(12); // 12 bytes for AES-GCM
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        // Encrypt
        let encrypted = cipher.update(req.body.message, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        // Log parameter lengths for verification
        console.log('Crypto parameter lengths:', {
            salt: salt.toString('hex').length, // Should be 32 (16 bytes)
            iv: iv.toString('hex').length,     // Should be 24 (12 bytes)
            authTag: authTag.length            // Should be 32 (16 bytes)
        });

        // Run encoding script with plaintext message and secret key
        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [
                sanitizedImagePath,
                req.body.message,
                normalizedOutputPath,
                req.body.secretKey
            ]
        };

        console.log('Running steg.py with args:', options.args);
        await runPythonScript('steg.py', options);

        // Verify metadata using Python script
        const metadataOptions = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [normalizedOutputPath]
        };
        const metadataOutput = await runPythonScript('read_metadata.py', metadataOptions);
        const metadata = JSON.parse(metadataOutput[0]);
        console.log('Metadata from Pillow:', metadata);
        if (!metadata.salt || !metadata.iv || !metadata.authTag) {
            throw new Error('Failed to embed cryptographic parameters in image');
        }
        
        res.download(normalizedOutputPath, 'encoded_image.png', async (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            await safeDelete(sanitizedImagePath);
            await safeDelete(normalizedOutputPath);
        });
    } catch (err) {
        console.error('Server error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
        if (sanitizedImagePath) await safeDelete(sanitizedImagePath);
        if (outputPath) await safeDelete(outputPath);
    }
});


// Add this near other helper functions
const safeDelete = async (path) => {
    if (fs.existsSync(path)) {
        try {
            await fs.promises.unlink(path);
        } catch (e) {
            console.error('Error cleaning up file:', e);
        }
    }
};

app.post('/decode', decodeLimiter, authenticateToken, upload.single('image'), async (req, res) => {
    let sanitizedImagePath;
    try {
        if (!req.file || !req.body.secretKey) {
            return res.status(400).json({ error: 'Image and secret key are required' });
        }

        sanitizedImagePath = path.normalize(req.file.path).replace(/\\/g, '/');

        // Extract metadata using Python script
        const metadataOptions = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [sanitizedImagePath]
        };
    

        const metadataOutput = await runPythonScript('read_metadata.py', metadataOptions);
        const textChunks = JSON.parse(metadataOutput[0]);
        
        if (!textChunks.salt || !textChunks.iv || !textChunks.authTag) {
            throw new Error('Missing crypto parameters in metadata');
        }

        console.log('Decode metadata:', textChunks);
        console.log('Decoding this file:', sanitizedImagePath);

        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [
                sanitizedImagePath,
                req.body.secretKey,
                textChunks.salt,
                textChunks.iv,
                textChunks.authTag
            ]
        };

        const results = await runPythonScript('decode_stego.py', options);
        res.json({ message: results[0] });
    } catch (err) {
        console.error('Server error:', err);
        if (!res.headersSent) {
            const status = err.message.includes('Invalid secret key') ? 401 : 500;
            res.status(status).json({ error: err.message });
        }
    } finally {
        await safeDelete(sanitizedImagePath);
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 