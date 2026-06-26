import React from 'react';

const LandingFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-theme-surface border-t border-theme pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/sfis-cloud-logo.png" alt="SFIS Logo" className="h-10 object-contain drop-shadow-sm" />
              <span className="text-2xl font-bold text-theme-primary tracking-tight">SFIS</span>
            </div>
            <p className="text-theme-secondary mb-6 max-w-sm leading-relaxed">
              AI-powered financial intelligence platform for smarter money management. Open source and built for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Yashwant-Vadhan/Cloud-Based-Distributed-Financial-Intelligence-System" target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-theme-primary transition-colors hover:-translate-y-1 transform duration-300">
                <span className="sr-only">GitHub Repository</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-theme-primary font-semibold mb-4 tracking-wide">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-theme-secondary hover:text-theme-accent transition-colors">Features</a></li>
              <li><a href="#product" className="text-theme-secondary hover:text-theme-accent transition-colors">Dashboard</a></li>
              <li><a href="#architecture" className="text-theme-secondary hover:text-theme-accent transition-colors">Architecture</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-theme-primary font-semibold mb-4 tracking-wide">Resources</h4>
            <ul className="space-y-3">
              <li><a href="https://github.com/Yashwant-Vadhan/Cloud-Based-Distributed-Financial-Intelligence-System" target="_blank" rel="noopener noreferrer" className="text-theme-secondary hover:text-theme-accent transition-colors">Documentation</a></li>
              <li><a href="#team" className="text-theme-secondary hover:text-theme-accent transition-colors">About Team</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-theme/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-theme-muted text-sm text-center md:text-left mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Smart Financial Intelligence System. MIT License.
          </p>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-theme-secondary hover:text-theme-accent text-sm font-medium transition-colors focus:outline-none bg-theme-surface2 px-4 py-2 rounded-full border border-theme"
          >
            Back to Top
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
