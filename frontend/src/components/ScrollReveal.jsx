import React, { useRef, useEffect, useState } from 'react';

/**
 * ScrollReveal Component
 * Wraps any element to give it smooth, luxury in & out animations upon viewport entry/exit.
 * 
 * Props:
 * - animation: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'blur-in' | 'rotate-in'
 * - delay: string (e.g. '0.2s', '150ms')
 * - duration: string (e.g. '0.8s')
 * - once: boolean (if false, animates in and out continuously as user scrolls)
 */
const ScrollReveal = ({
  children,
  animation = 'fade-up',
  delay = '0s',
  duration = '0.85s',
  once = false,
  className = '',
  style = {}
}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          // Out animation
          setIsInView(false);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className={`scroll-reveal-container ${animation} ${isInView ? 'is-in-view' : 'is-out-view'} ${className}`}
      style={{
        '--animation-delay': delay,
        '--animation-duration': duration,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
