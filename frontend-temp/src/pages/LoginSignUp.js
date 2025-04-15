import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
                <form>
                    {isSignup && (
                        <motion.div
                            className="auth-form-group"
                            custom={0}
                            variants={formVariants}
                        >
                            <label className="auth-label">Name</label>
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="Your Name"
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
