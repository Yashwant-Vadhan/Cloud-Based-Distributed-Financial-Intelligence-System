import React from 'react';
import './Landing.css';

const HeroSection = ({ onNavigate }) => {
  return (
    <section id="home" className="pt-32 pb-20 relative overflow-hidden bg-theme-primary">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-theme-accent opacity-20 blur-[100px] animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-[#8b5cf6] opacity-10 blur-[100px] animate-float-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Hero Content */}
          <div className="w-full lg:w-1/2 space-y-8 reveal-on-scroll is-visible">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border-theme text-theme-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-theme-btn animate-pulse"></span>
              Welcome to SFIS
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-theme-primary leading-tight">
              Smart Financial <br className="hidden lg:block"/>
              <span className="text-gradient">Intelligence System</span>
            </h1>
            
            <p className="text-lg text-theme-secondary max-w-2xl leading-relaxed">
              AI-powered cloud-native financial management platform built using distributed microservices on Microsoft Azure. Take control of your financial future today.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigate('signup')}
                className="btn-premium px-8 py-3.5 rounded-lg font-semibold text-lg flex items-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-theme-accent"
              >
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="btn-outline-premium px-8 py-3.5 rounded-lg font-semibold text-lg focus:ring-2 focus:ring-offset-2 focus:ring-theme-accent"
              >
                Sign In
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-4 text-sm font-medium text-theme-muted">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                AI Powered
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Secure Auth
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Cloud Native
              </div>
            </div>
          </div>

          {/* Hero Image / Mockup */}
          <div className="w-full lg:w-1/2 relative lg:h-[500px] reveal-on-scroll is-visible delay-200 tilt-container">
            <div className="relative w-full h-full rounded-2xl shadow-2xl glass-panel p-2 animate-float-slow tilt-inner">
              <div className="w-full h-full overflow-hidden rounded-xl bg-theme-surface2 border border-theme flex items-center justify-center">
                <img 
                  src="/images/mockups/analytics.png" 
                  alt="SFIS Analytics Preview" 
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl glass-panel p-2 animate-float-fast shadow-xl hidden md:block border border-theme">
               <div className="w-full h-full bg-theme-surface rounded-xl p-3 flex flex-col justify-center items-center gap-2">
                 <div className="text-2xl font-bold text-green-500">+$2k</div>
                 <div className="text-xs text-theme-muted text-center">Savings Increased</div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
