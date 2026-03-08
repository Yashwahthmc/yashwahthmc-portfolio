import React, { useState } from 'react';
import { Award, ExternalLink, FileText, Eye, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import './Certificates.css';

const Certificates = () => {
  const { certificates } = usePortfolio();
  const [pdfPreview, setPdfPreview] = useState(null);

  return (
    <div className="section animate-fade-in" style={{ paddingTop: '8rem' }}>
      <div className="container">
        <h2 className="section-title text-gradient">My Certificates</h2>
        
        <div className="certs-grid">
          {certificates.map((cert) => (
            <div key={cert.id} className="cert-card glass-card">
              <div className="cert-img-wrapper">
                {cert.image ? (
                  <img src={cert.image} alt={cert.name} className="cert-img" />
                ) : cert.pdf ? (
                  <div className="cert-placeholder">
                    <FileText size={60} className="cert-icon-large" />
                    <span>PDF Available</span>
                  </div>
                ) : (
                  <div className="cert-placeholder">
                    <Award size={60} className="cert-icon-large" />
                  </div>
                )}
              </div>
              <div className="cert-info">
                <h3>{cert.name}</h3>
                <h4 className="cert-issuer">{cert.issuer}</h4>
                <div className="cert-meta">
                  <span className="cert-date">Issued: {cert.date}</span>
                </div>
                <div className="cert-actions">
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline cert-btn">
                      View Credential <ExternalLink size={16} />
                    </a>
                  )}
                  {cert.pdf && (
                    <button 
                      type="button" 
                      className="btn btn-outline cert-btn"
                      onClick={() => setPdfPreview(pdfPreview === cert.id ? null : cert.id)}
                    >
                      <Eye size={16} /> {pdfPreview === cert.id ? 'Hide PDF' : 'View PDF'}
                    </button>
                  )}
                </div>
                {pdfPreview === cert.id && cert.pdf && (
                  <div className="cert-pdf-inline-preview">
                    <iframe 
                      src={cert.pdf} 
                      title={`${cert.name} PDF`} 
                      className="cert-pdf-iframe"
                    ></iframe>
                  </div>
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
