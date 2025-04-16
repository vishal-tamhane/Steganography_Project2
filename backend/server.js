const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { hashPassword, comparePassword, authenticateToken } = require('./auth');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Protect encode and decode routes
app.post('/encode', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file || !req.body.message) {
        return res.status(400).json({ error: 'Image and message are required' });
    }

    const outputPath = path.join(uploadsDir, `encoded_${Date.now()}.png`);

    const options = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: __dirname,
        args: [
            req.file.path,
            req.body.message,
            outputPath
        ]
    };

    PythonShell.run('steg.py', options, (err, results) => {
        if (err) {
            console.error('Error running steg.py:', err);
            return res.status(500).json({ error: 'Error encoding image' });
        }

        res.download(outputPath, 'encoded_image.png', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Clean up files
            try {
                fs.unlinkSync(req.file.path);
                fs.unlinkSync(outputPath);
            } catch (e) {
                console.error('Error cleaning up files:', e);
            }
        });
    });
});

app.post('/decode', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }

    const options = {
        mode: 'text',
        pythonOptions: ['-u'],
        scriptPath: __dirname,
        args: [req.file.path]
    };

    PythonShell.run('decode_stego.py', options, (err, results) => {
        if (err) {
            console.error('Error running decode_stego.py:', err);
            return res.status(500).json({ error: 'Error decoding image' });
        }

        // Clean up file
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) {
            console.error('Error cleaning up file:', e);
        }
        
        res.json({ message: results[0] });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 