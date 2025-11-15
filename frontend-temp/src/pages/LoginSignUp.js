import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
// API base (use REACT_APP_API_URL in production)
const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const formVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: i => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15 }
    })
};

const LoginSignup = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Handle Google OAuth redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const user = params.get('user');
        if (token && user) {
            login(token, JSON.parse(user));
            navigate('/');
        }
    }, [login, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isSignup && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
                const endpoint = isSignup ? '/api/signup' : '/api/login';
                const response = await axios.post(`${API}${endpoint}`, {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });

            // Store token and user info
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Redirect to home page
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="auth-page">
            {/* Left Info Section */}
            <div className="auth-info">
                <h2>Why Sign Up?</h2>
                <ul>
                    <li>🔒 Secure your secret messages</li>
                    <li>🖼️ Access your encoded images anytime</li>
                    <li>💬 Decode messages sent to you</li>
                    <li>🌐 Enjoy a seamless, private experience</li>
                </ul>

            </div>

            {/* Right Form Section */}
            <motion.div
                className="auth-form"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.15 } }
                }}
            >
                <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <motion.div
                            className="auth-form-group"
                            custom={0}
                            variants={formVariants}
                        >
                            <label className="auth-label">Username</label>
                            <input
                                className="auth-input"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Your Username"
                                required
                            />
                        </motion.div>
                    )}

                    <motion.div
                        className="auth-form-group"
                        custom={isSignup ? 1 : 0}
                        variants={formVariants}
                    >
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </motion.div>

                    <motion.div
                        className="auth-form-group"
                        custom={isSignup ? 2 : 1}
                        variants={formVariants}
                    >
                        <label className="auth-label">Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                        />
                    </motion.div>

                    {isSignup && (
                        <motion.div
                            className="auth-form-group"
                            custom={3}
                            variants={formVariants}
                        >
                            <label className="auth-label">Confirm Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                required
                            />
                        </motion.div>
                    )}

                    <motion.div
                        className="auth-form-group"
                        custom={isSignup ? 4 : 2}
                        variants={formVariants}
                    >
                        <button type="submit" className="auth-btn">
                            {isSignup ? 'Sign Up' : 'Login'}
                        </button>
                        <div className="auth-toggle" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            {isSignup ? (
                                <span>
                                    Already have an account?{' '}
                                    <button type="button" className="auth-toggle-btn" onClick={() => setIsSignup(false)}>
                                        Login
                                    </button>
                                </span>
                            ) : (
                                <span>
                                    Don't have an account?{' '}
                                    <button type="button" className="auth-toggle-btn" onClick={() => setIsSignup(true)}>
                                        Sign Up
                                    </button>
                                </span>
                            )}
                        </div>
                    </motion.div>
                </form>
                {/* Google Login at the bottom */}
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <button
                        type="button"
                        className="auth-btn"
                        style={{ background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                            onClick={() => {
                            window.location.href = `${API}/auth/google`;
                        }}
                        aria-label="Sign in with Google"
                    >
                       <img 
                            src="https://static.dezeen.com/uploads/2025/05/sq-google-g-logo-update_dezeen_2364_col_0-852x852.jpg" 
                            alt="Google Logo" 
                            width="32" 
                            height="32" 
                            style={{borderRadius: '4px'}} 
                         />

                    </button>
                    <div style={{ fontSize: '0.95rem', color: '#555', marginTop: 8 }}>
                        {isSignup ? 'Sign up with Google' : 'Login with Google'}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginSignup;
