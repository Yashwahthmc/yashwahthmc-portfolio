import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Github, Settings, Menu, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { socialLinks, personalInfo } = usePortfolio();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="brand" onClick={closeMobileMenu}>
          <Code2 size={28} className="brand-icon" />
          <span>{personalInfo.brandName}<span className="dot">.</span></span>
        </Link>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMobileMenu}>Home</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMobileMenu}>About</Link></li>
          <li><Link to="/experience" className={location.pathname === '/experience' ? 'active' : ''} onClick={closeMobileMenu}>Work</Link></li>
          <li><Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''} onClick={closeMobileMenu}>Projects</Link></li>
          <li><Link to="/certificates" className={location.pathname === '/certificates' ? 'active' : ''} onClick={closeMobileMenu}>Certs</Link></li>
        </ul>

        <div className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline github-btn">
            <Github size={18} /> Star
          </a>
          <Link to="/login" className="settings-icon-btn" title="Admin Dashboard" onClick={closeMobileMenu}>
            <Settings size={20} className="settings-icon" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
