import React, { useEffect } from 'react';
import LandingNavbar from '../components/Landing/LandingNavbar';
import HeroSection from '../components/Landing/HeroSection';
import WhatIsSfis from '../components/Landing/WhatIsSfis';
import FeatureCards from '../components/Landing/FeatureCards';
import PlatformHighlights from '../components/Landing/PlatformHighlights';
import ProductWalkthrough from '../components/Landing/ProductWalkthrough';
import ArchitectureSection from '../components/Landing/ArchitectureSection';
import TechStackCards from '../components/Landing/TechStackCards';
import TeamSection from '../components/Landing/TeamSection';
import StatisticsSection from '../components/Landing/StatisticsSection';
import LandingFooter from '../components/Landing/LandingFooter';

const Landing = ({ onNavigate }) => {
  // Ensure the page scrolls to top when loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optional: unobserve after revealing
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-theme-primary min-h-screen text-theme-primary font-sans selection:bg-theme-accent selection:text-white transition-colors duration-300">
      <LandingNavbar onNavigate={onNavigate} />
      <HeroSection onNavigate={onNavigate} />
      <div id="features">
        <WhatIsSfis />
        <FeatureCards />
        <PlatformHighlights />
      </div>
      <div id="product">
        <ProductWalkthrough />
      </div>
      <div id="architecture">
        <ArchitectureSection />
        <TechStackCards />
      </div>
      <div id="team">
        <TeamSection />
        <StatisticsSection />
      </div>
      <LandingFooter />
    </div>
  );
};

export default Landing;
