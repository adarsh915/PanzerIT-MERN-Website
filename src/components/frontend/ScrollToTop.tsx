'use client';

import { useEffect, useState } from 'react';

export function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // Start as true for testing

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Calculate scroll progress
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          
          // Calculate percentage scrolled
          const totalScroll = documentHeight - windowHeight;
          const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
          
          // Clamp progress between 0 and 100
          const clampedProgress = Math.min(Math.max(progress, 0), 100);
          
          setScrollProgress(clampedProgress);
          
          // Show button after scrolling down 100px
          const shouldShow = scrollTop > 100;
          setIsVisible(shouldShow);
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Call once to set initial state
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    console.log('Scrolling to top');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    right: '12px',
    bottom: '185px',
    width: '60px',
    height: '60px',
    background: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 9999,
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
  };

  const arrowStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '20px',
    color: '#ffffff',
  };

  const svgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  };

  const circumference = 2 * Math.PI * 26;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div 
      style={buttonStyle}
      onClick={scrollToTop}
      role="button"
      aria-label="Scroll to top"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToTop();
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 102, 255, 0.9)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
        e.currentTarget.style.transform = isVisible ? 'translateY(0)' : 'translateY(20px)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
      }}
    >
      <svg style={svgStyle} width="60" height="60">
        {/* Background circle */}
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="none"
          stroke="#0066ff"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.2s linear'
          }}
        />
      </svg>
      <div style={arrowStyle}>
        <i className="fa-light fa-arrow-up" style={iconStyle}></i>
      </div>
    </div>
  );
}
