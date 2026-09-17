import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition Component
 * Provides seamless, cinematic page entrance and exit animations on route changes.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter-active');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('page-exit-active');
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('page-enter-active');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div className={`page-transition-wrapper ${transitionStage}`}>
      {/* Subtle top gold energy progress indicator during transitions */}
      <div className="luxury-page-glimmer-bar" />
      {children}
    </div>
  );
};

export default PageTransition;
