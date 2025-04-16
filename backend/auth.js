const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Helper function to hash password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Helper function to compare password
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    authenticateToken,
    hashPassword,
    comparePassword
}; 