import React, { useState } from 'react';

const ArchitectureSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-theme-surface border-y border-theme relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16 reveal-on-scroll">
          <h2 className="text-sm font-bold text-theme-accent tracking-widest uppercase mb-3">Enterprise Grade</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">Cloud-Native Architecture</h3>
          <p className="text-theme-secondary max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            Built on a distributed microservices architecture using Microsoft Azure Container Apps, 
            ensuring high availability, elastic scalability, and enterprise-grade security.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto reveal-on-scroll delay-200">
          <div 
            className="rounded-2xl glass-panel border border-theme p-3 md:p-8 bg-theme-surface2 shadow-2xl hover-zoom-img cursor-pointer group"
            onClick={() => setModalOpen(true)}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center rounded-2xl">
              <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 shadow-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                <span className="hidden sm:inline">Click to Enlarge Architecture</span>
                <span className="sm:hidden">Enlarge</span>
              </div>
            </div>
            <img 
              src="/images/Smart-Financial-Intelligence-System-Architecture.png" 
              alt="SFIS System Architecture Diagram" 
              className="w-full h-auto rounded-lg shadow-sm"
              onError={(e) => { e.target.src = '/architecture.png' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-16">
          {[
            { name: "Frontend", icon: "⚛️" },
            { name: "Auth Service", icon: "🔐" },
            { name: "Expense Service", icon: "💳" },
            { name: "ML Service", icon: "🧠" },
            { name: "Azure Container Apps", icon: "☁️" },
            { name: "GitHub Actions", icon: "⚙️" },
            { name: "Azure Bicep", icon: "🏗️" },
            { name: "Docker", icon: "🐳" }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel py-4 px-2 rounded-xl border border-theme hover:bg-theme-surface2 transition-colors">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-theme-primary text-sm">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="relative max-w-7xl w-full max-h-[90vh] modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2"
              onClick={() => setModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="bg-white p-2 md:p-4 rounded-xl flex items-center justify-center">
              <img 
                src="/images/Smart-Financial-Intelligence-System-Architecture.png" 
                alt="SFIS System Architecture Diagram" 
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => { e.target.src = '/architecture.png' }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ArchitectureSection;
