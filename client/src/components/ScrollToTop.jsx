// client/src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the very top smoothly when the path changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Change to 'auto' if you want it to snap instantly instead of sliding
    });
  }, [pathname]);

  return null; // This component doesn't render anything visually
};

export default ScrollToTop;