// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EncodePage from './pages/EncodePage';
import DecodePage from './pages/DecodePage';
import HomePage from './pages/HomePage';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import About from './pages/About';
import LoginSignUp from './pages/LoginSignUp';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="container mx-auto p-4">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginSignUp />} />
                        <Route path="/about" element={<About />} />
                        <Route
                            path="/encode"
                            element={
                                <ProtectedRoute>
                                    <EncodePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/decode"
                            element={
                                <ProtectedRoute>
                                    <DecodePage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;
