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

// Update multer configuration to handle the 'image' field
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

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

// Helper function to extract metadata from image
const extractFromImage = async (imagePath) => {
    try {
        console.log('\n=== Starting Metadata Extraction ===');
        console.log(`Extracting from: ${imagePath}`);
        
        // First verify the image exists and is readable
        try {
            await fs.promises.access(imagePath, fs.constants.R_OK);
        } catch (err) {
            throw new Error(`Image file not accessible: ${err.message}`);
        }
        
        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        console.log('\n=== Image Metadata ===');
        console.log('Format:', metadata.format);
        console.log('Size:', metadata.size);
        console.log('Width:', metadata.width);
        console.log('Height:', metadata.height);
        
        // Log all available metadata for debugging
        console.log('\n=== All Available Metadata ===');
        console.log('Raw metadata:', metadata);
        
        // Create a map to store extracted metadata
        const metadataMap = {};
        
        // Extract metadata from comments if available
        if (metadata.comments && Array.isArray(metadata.comments)) {
            console.log('\n=== Processing Comments ===');
            metadata.comments.forEach(comment => {
                if (comment.keyword && comment.text) {
                    console.log(`Found comment: ${comment.keyword} = ${comment.text}`);
                    metadataMap[comment.keyword] = comment.text;
                }
            });
        }
        
        // Also check text metadata
        if (metadata.text) {
            console.log('\n=== Processing Text Metadata ===');
            Object.entries(metadata.text).forEach(([key, value]) => {
                console.log(`Found text: ${key} = ${value}`);
                metadataMap[key] = value;
            });
        }
        
        // Log the processed metadata map
        console.log('\n=== Processed Metadata Map ===');
        console.log(metadataMap);
        
        // Check for presence of all required metadata
        console.log('\n=== Checking Required Metadata ===');
        const salt = metadataMap['salt'];
        const iv = metadataMap['iv'];
        const authTag = metadataMap['authTag'];
        
        if (!salt) {
            throw new Error('Missing salt in metadata');
        }
        if (!iv) {
            throw new Error('Missing IV in metadata');
        }
        if (!authTag) {
            throw new Error('Missing auth tag in metadata');
        }
        
        const extracted = {
            salt: salt,
            iv: iv,
            authTag: authTag
        };
        
        console.log('\n=== Extracted Metadata ===');
        console.log('Processed metadata:', extracted);
        
        // Verify metadata lengths
        const saltLength = extracted.salt.length;
        const ivLength = extracted.iv.length;
        const authTagLength = extracted.authTag.length;
        
        console.log('\n=== Metadata Lengths ===');
        console.log('Salt length:', saltLength);
        console.log('IV length:', ivLength);
        console.log('Auth tag length:', authTagLength);
        
        // Validate lengths
        if (saltLength !== 32) {
            throw new Error(`Invalid salt length: ${saltLength} (expected 32)`);
        }
        if (ivLength !== 24) {
            throw new Error(`Invalid IV length: ${ivLength} (expected 24)`);
        }
        if (authTagLength !== 32) {
            throw new Error(`Invalid auth tag length: ${authTagLength} (expected 32)`);
        }
        
        // Validate hex format
        const hexRegex = /^[0-9a-fA-F]+$/;
        console.log('\n=== Validating Hex Format ===');
        
        if (!hexRegex.test(extracted.salt)) {
            throw new Error('Invalid salt format: not a valid hex string');
        }
        if (!hexRegex.test(extracted.iv)) {
            throw new Error('Invalid IV format: not a valid hex string');
        }
        if (!hexRegex.test(extracted.authTag)) {
            throw new Error('Invalid auth tag format: not a valid hex string');
        }
        
        console.log('All metadata validation passed');
        console.log('\n=== Extraction Complete ===');
        
        return extracted;
    } catch (err) {
        console.error('\n=== Extraction Error ===');
        console.error('Error details:', err);
        throw err;
    }
};

// ========== ENCODE ENDPOINT ==========
app.post('/encode', authenticateToken, upload.single('image'), async (req, res) => {
    let sanitizedImagePath;
    let outputPath;
    let tempOutputPath;
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
        tempOutputPath = outputPath + '.tmp';
        const normalizedOutputPath = outputPath.replace(/\\/g, '/');
        const normalizedTempPath = tempOutputPath.replace(/\\/g, '/');

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

        // Run encoding script with encrypted message and crypto parameters
        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [
                sanitizedImagePath,
                encrypted,
                normalizedTempPath,  // Use temp path for atomic operation
                salt.toString('hex'),
                iv.toString('hex'),
                authTag
            ]
        };

        console.log('Running steg.py with args:', options.args);
        await runPythonScript('steg.py', options);

        // Verify the encoded image
        const metadata = await extractFromImage(normalizedTempPath);
        console.log('Verified metadata:', metadata);

        // Atomic rename
        await fs.promises.rename(normalizedTempPath, normalizedOutputPath);
        
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
        if (tempOutputPath) await safeDelete(tempOutputPath);
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

app.post('/decode', authenticateToken, upload.single('image'), async (req, res) => {
    let uploadedFilePath;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }
        uploadedFilePath = req.file.path;

        // Use PythonShell instead of exec for better error handling
        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: __dirname,
            args: [uploadedFilePath, req.body.secretKey]
        };

        const output = await runPythonScript('decode_Steg0.py', options);
        
        // The last line of output should be the decoded message
        const decodedMessage = output[output.length - 1];
        
        res.json({ message: decodedMessage });
    } catch (err) {
        console.error('Server error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    } finally {
        // Clean up the uploaded file
        if (uploadedFilePath) {
            await safeDelete(uploadedFilePath);
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 

