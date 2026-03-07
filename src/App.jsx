import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Experience from './pages/Experience';
import Certificates from './pages/Certificates';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = usePortfolio();
  
  if (authLoading) return null; // Or a smaller spinner
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppInner = () => {
  const { loading, authLoading } = usePortfolio();
  
  if (loading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: 'var(--bg-color)' }}>
        <div style={{ width: 60, height: 60, border: '4px solid rgba(0,240,255,0.15)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        <p style={{ color: 'var(--primary-color)', letterSpacing: 2, fontSize: '1rem' }}>Loading Portfolio...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return (
    <div className="app">
      <div className="particles-layer"></div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <PortfolioProvider>
      <AppInner />
    </PortfolioProvider>
  );
}

export default App;
