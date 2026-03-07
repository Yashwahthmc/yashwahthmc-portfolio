import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Terminal } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { usePortfolio } from '../context/PortfolioContext';
import './Home.css';

const Home = () => {
  const { personalInfo, documents } = usePortfolio();
  const words = personalInfo.titles.length > 0 ? personalInfo.titles : ["Developer"];
  const [currentWord, setCurrentWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setCurrentWord(
        isDeleting
          ? fullText.substring(0, currentWord.length - 1)
          : fullText.substring(0, currentWord.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && currentWord === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
        setTypingSpeed(100);
      } else if (isDeleting && currentWord === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, loopNum, typingSpeed, words]);

  return (
    <div className="home-container section animate-fade-in">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text-area">
            <h2 className="greeting">Hello, World! I'm</h2>
            <h1 className="name text-gradient">{personalInfo.name}</h1>
            <h3 className="typewriter">
              <Terminal size={24} className="terminal-icon" /> Developing <span className="word">{currentWord}</span><span className="cursor">|</span>
            </h3>
            <p className="description">
              {personalInfo.description}
            </p>
            
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-primary">
                View Work <ArrowRight size={18} />
              </Link>
              <a 
                href={documents.length > 0 && documents[0].url ? documents[0].url : personalInfo.resumeLink} 
                download="Resume.pdf" 
                className="btn btn-outline"
                target={documents.length > 0 && documents[0].url?.startsWith('data:') ? "_self" : "_blank"}
                rel="noreferrer"
              >
                <Download size={18} /> Resume
              </a>
            </div>
          </div>
          
          <div className="hero-image-area">
            <div className="lottie-scene">
              {/* Orbital ring */}
              <div className="orbital-ring"></div>
              <div className="orbital-ring ring-2"></div>

              {/* Floating tech badges */}
              <div className="tech-badge badge-1">⚛️ React</div>
              <div className="tech-badge badge-2">🟨 JavaScript</div>
              <div className="tech-badge badge-3">🎨 CSS3</div>
              <div className="tech-badge badge-4">🚀 Node.js</div>
              <div className="tech-badge badge-5">🐙 GitHub</div>

              {/* Main animation */}
              <div className="lottie-wrapper">
                <DotLottieReact
                  src="https://lottie.host/e3285526-39e9-4c2c-a78c-243fe14d1ecd/b0dlDJwfX8.lottie"
                  loop
                  autoplay
                />
              </div>
              <div className="glow-orb"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
