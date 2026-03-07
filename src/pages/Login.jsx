import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const isOffline = import.meta.env.VITE_OFFLINE_MODE === 'true';

    if (isOffline) {
      // Mock login for testing
      setTimeout(() => {
        if (email === 'admin@portfolio.com' && password === 'admin123') {
          navigate('/dashboard');
        } else {
          setIsLoading(false);
          setError('Offline Mode: Use admin@portfolio.com / admin123');
        }
      }, 500);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase login successful
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      // Show user-friendly error messages
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Incorrect email or password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please wait a moment and try again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="section login-section animate-fade-in">
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="login-card glass-card">
          <div className="login-header">
            <div className="login-icon-ring">
              <LogIn size={28} />
            </div>
            <h2>Admin Login</h2>
            <p>Sign in securely to manage your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isLoading}
            >
              {isLoading
                ? <><span className="spinner"></span> Authenticating...</>
                : <><LogIn size={18} /> Login to Dashboard</>
              }
            </button>
          </form>

          <div className="login-footer">
            <p>🔒 Secured by Firebase Authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
