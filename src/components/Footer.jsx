import React from 'react';
import './Footer.css';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const Footer = () => {
  const { socialLinks, personalInfo } = usePortfolio();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>{personalInfo.brandName}<span className="dot">.</span></h3>
            <p>Designed and built with passion & code.</p>
          </div>
          
          <div className="social-links">
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-icon">
              <Github size={20} />
            </a>
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
              <Linkedin size={20} />
            </a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-icon">
              <Twitter size={20} />
            </a>
            <a href={`mailto:${socialLinks.email}`} className="social-icon">
              <Mail size={20} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
