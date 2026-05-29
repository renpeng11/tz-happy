import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top-btn fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white border-none cursor-pointer flex items-center justify-center text-xl shadow-lg z-[1000] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
    >
      <i className="fas fa-arrow-up" />
    </button>
  );
}
