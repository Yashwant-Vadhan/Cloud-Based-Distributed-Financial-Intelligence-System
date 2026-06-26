import React, { useState, useEffect } from 'react';

const LandingNavbar = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Add blur and shadow when scrolled
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Scrollspy logic
      const sections = ['home', 'features', 'product', 'architecture', 'team'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Offset for navbar height
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) {
        setActiveSection(current);
      } else if (window.scrollY < 100) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70, // offset for fixed navbar
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'product', label: 'Product' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'team', label: 'Team' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-theme-surface/80 backdrop-blur-md shadow-sm border-b border-theme/50 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => scrollToSection(e, 'home')}>
            <img src="/sfis-cloud-logo.png" alt="SFIS Logo" className="h-8 md:h-10 object-contain drop-shadow-sm" />
            <span className="text-xl font-bold text-theme-primary tracking-tight">SFIS</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-theme-elevated/50 ${
                  activeSection === link.id 
                    ? 'text-theme-accent' 
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                {link.label}
                {/* Animated underline for active state */}
                {activeSection === link.id && (
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-theme-accent rounded-full animate-fade-in-up" />
                )}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => onNavigate('login')}
              className="text-theme-primary font-medium text-sm hover:text-theme-accent px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-md"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="btn-premium px-5 py-2 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-theme-primary p-2 focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-md"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-theme-surface border-b border-theme shadow-lg animate-fade-in-up">
          <div className="px-4 py-4 space-y-2 flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activeSection === link.id 
                    ? 'bg-theme-elevated text-theme-accent' 
                    : 'text-theme-secondary hover:bg-theme-elevated hover:text-theme-primary'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-theme w-full my-2"></div>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-theme-primary hover:bg-theme-elevated transition-colors focus:outline-none"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full text-center px-4 py-3 rounded-lg text-base font-bold bg-theme-btn text-white shadow-sm hover:shadow-md transition-all focus:outline-none"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
