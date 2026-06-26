import React, { useState } from 'react';

const screenshots = [
  { id: 'dashboard', name: 'Dashboard', file: 'dashboard.png', desc: 'Unified view of your financial health' },
  { id: 'income', name: 'Income Management', file: 'income.png', desc: 'Track and categorize multiple income sources' },
  { id: 'expenses', name: 'Expense Management', file: 'expense.png', desc: 'Detailed logging and expense categorization' },
  { id: 'analytics', name: 'Financial Analytics', file: 'analytics.png', desc: 'Interactive charts to visualize spending habits' },
  { id: 'predictions', name: 'AI Predictions', file: 'predictions.png', desc: 'Smart AI insights for better financial decisions' },
  { id: 'settings', name: 'Settings', file: 'settings.png', desc: 'Personalize themes and manage your account' }
];

const ProductWalkthrough = () => {
  const [activeTab, setActiveTab] = useState(screenshots[0]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-24 bg-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-sm font-bold text-theme-accent tracking-widest uppercase mb-3">Product Overview</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">A complete view of your finances</h3>
          <p className="text-theme-secondary max-w-2xl mx-auto text-lg">
            Everything you need to manage wealth, track expenses, and predict future trends in one beautiful dashboard.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          
          {/* Navigation List (30%) */}
          <div className="w-full lg:w-[35%] flex flex-col space-y-3 reveal-on-scroll delay-100">
            {screenshots.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item)}
                className={`text-left p-5 rounded-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-theme-accent ${
                  activeTab.id === item.id 
                    ? 'bg-theme-surface2 border-theme-accent shadow-md scale-[1.02]' 
                    : 'bg-theme-surface border-transparent hover:border-theme hover:bg-theme-surface2'
                }`}
              >
                <h4 className={`text-lg font-bold mb-1 ${activeTab.id === item.id ? 'text-theme-accent' : 'text-theme-primary'}`}>
                  {item.name}
                </h4>
                <p className="text-theme-secondary text-sm leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>

          {/* Screenshot Display (70%) */}
          <div className="w-full lg:w-[65%] reveal-on-scroll delay-300">
            <div 
              className="relative rounded-2xl overflow-hidden glass-panel border border-theme shadow-2xl p-2 bg-theme-surface hover-zoom-img cursor-pointer group"
              onClick={() => setModalOpen(true)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center rounded-2xl">
                <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 shadow-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  Click to Expand
                </div>
              </div>
              <img 
                key={activeTab.id}
                src={`/images/mockups/${activeTab.file}`} 
                alt={activeTab.name}
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="relative max-w-6xl w-full max-h-[90vh] modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2"
              onClick={() => setModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img 
              src={`/images/mockups/${activeTab.file}`} 
              alt={activeTab.name}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductWalkthrough;
