import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import './Certificates.css';

const Certificates = () => {
  const { certificates } = usePortfolio();

  return (
    <div className="section animate-fade-in" style={{ paddingTop: '8rem' }}>
      <div className="container">
        <h2 className="section-title text-gradient">My Certificates</h2>
        
        <div className="certs-grid">
          {certificates.map((cert) => (
            <div key={cert.id} className="cert-card glass-card">
              <div className="cert-icon-wrapper" style={cert.image ? { padding: 0, overflow: 'hidden', background: 'transparent' } : {}}>
                {cert.image ? (
                  <img src={cert.image} alt={cert.name} className="cert-image-large" />
                ) : (
                  <Award size={40} className="cert-icon-large" />
                )}
              </div>
              <div className="cert-info">
                <h3>{cert.name}</h3>
                <h4 className="cert-issuer">{cert.issuer}</h4>
                <div className="cert-meta">
                  <span className="cert-date">Issued: {cert.date}</span>
                </div>
                {/* For public URL reference */}
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline cert-btn">
                    View Credential <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
          {certificates.length === 0 && (
            <p>No certificates available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;
