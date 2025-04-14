const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs');

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

// API endpoint to encode image
app.post('/encode', upload.single('image'), (req, res) => {
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

// API endpoint to decode image
app.post('/decode', upload.single('image'), (req, res) => {
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