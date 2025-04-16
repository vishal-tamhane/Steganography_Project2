import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

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
            const response = await axios.post(`http://localhost:3001${endpoint}`, {
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
                        <div className="auth-toggle">
                            {isSignup ? (
                                <span>
                                    Already have an account?{' '}
                                    <button onClick={() => setIsSignup(false)}>Login</button>
                                </span>
                            ) : (
                                <span>
                                    New here?{' '}
                                    <button onClick={() => setIsSignup(true)}>Sign Up</button>
                                </span>
                            )}
                        </div>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginSignup;
