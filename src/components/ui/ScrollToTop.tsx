import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll to the top on navigation, or to the element named by the URL
 * hash (e.g. /services#getting-married) when there is one.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    // Wait a frame so the target page has rendered.
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
