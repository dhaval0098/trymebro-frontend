import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Universal Scroll & Viewport In/Out Animation Controller
 * Safely marks elements as visible and keeps animations smooth without ever hiding content.
 */
export const useScrollAnimation = () => {
  const location = useLocation();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '100px 0px 100px 0px',
      threshold: 0
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        if (entry.isIntersecting) {
          target.classList.add('is-in-view');
          target.classList.remove('is-out-view');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    const observeElement = (el) => {
      if (!el || el.dataset?.observed === 'true') return;
      el.dataset.observed = 'true';
      el.classList.add('is-in-view');
      el.classList.remove('is-out-view');
      observer.observe(el);
    };

    const observeAll = () => {
      const elements = document.querySelectorAll('[data-animate], .animate-on-scroll, .scroll-reveal-container');
      elements.forEach(observeElement);
    };

    observeAll();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && (node.matches('[data-animate]') || node.matches('.animate-on-scroll') || node.matches('.scroll-reveal-container'))) {
              observeElement(node);
            }
            if (node.querySelectorAll) {
              const children = node.querySelectorAll('[data-animate], .animate-on-scroll, .scroll-reveal-container');
              children.forEach(observeElement);
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    const timer = setTimeout(observeAll, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);
};

export default useScrollAnimation;

