import React from 'react';
import { Briefcase, Award } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import './Experience.css';

const Experience = () => {
  const { experiences } = usePortfolio();

  return (
    <div className="section animate-fade-in" style={{ paddingTop: '8rem' }}>
      <div className="container">
        <h2 className="section-title text-gradient">Work Experience</h2>
        
        <div className="timeline">
          {experiences.map((exp) => (
            <div key={exp.id} className="timeline-item">
              <div className="timeline-marker">
                <Briefcase size={20} />
              </div>
              <div className="timeline-content glass-card">
                <span className="timeline-duration">{exp.duration}</span>
                <h3>{exp.role}</h3>
                <h4 className="company-name">{exp.company}</h4>
                <p>{exp.description}</p>
                {exp.certificateUrl && (
                  <a href={exp.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    <Award size={16} /> View {exp.certificateName || 'Certificate'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;
