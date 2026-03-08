import React from 'react';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { usePortfolio, defaultPersonalInfo } from '../context/PortfolioContext';
import './About.css';

const About = () => {
  const { aboutInfo, socialLinks, personalInfo } = usePortfolio();
  const displayImage = aboutInfo.aboutImage || personalInfo.heroImage;
  const hasImage = !!displayImage;

  return (
    <div className="section about-section animate-fade-in" style={{ paddingTop: '8rem' }}>
      <div className="container">
        <h2 className="section-title text-gradient">About Me</h2>

        <div className={`about-content ${hasImage ? 'has-image' : ''}`}>
          <div className="about-text glass-card">
            <h3>Who am I?</h3>
            {aboutInfo.description.split('\n\n').map((para, i) => (
              <p key={i} style={{ marginTop: i > 0 ? '1rem' : 0 }}>{para}</p>
            ))}

            <div className="contact-info" style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Connect With Me</h4>
              <div className="contact-links">
                <a href={`mailto:${socialLinks.email}`} className="contact-link">
                  <Mail size={20} /> <span className="contact-text">Email Me</span>
                </a>
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <Github size={20} /> <span className="contact-text">GitHub</span>
                </a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <Linkedin size={20} /> <span className="contact-text">LinkedIn</span>
                </a>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <Twitter size={20} /> <span className="contact-text">Twitter / X</span>
                </a>
              </div>
            </div>
          </div>

          {hasImage && (
            <div className="about-image-column animate-fade-in">
              <div className="about-image-wrapper animate-float">
                <img src={displayImage} alt={personalInfo.name} className="about-photo" />
                <div className="image-glass-frame"></div>
                <div className="image-accent-border"></div>
              </div>
            </div>
          )}
        </div>

        <div className="skills-container animate-fade-in">
          {aboutInfo.skills.map((skillSet) => (
            <div key={skillSet.id} className="skill-card glass-card">
              <h4>{skillSet.category}</h4>
              <div className="tags">
                {skillSet.items.split(',').map((item, i) => (
                  <span key={i} className="skill-tag">{item.trim()}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
