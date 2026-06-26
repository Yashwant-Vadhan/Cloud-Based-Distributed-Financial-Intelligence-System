import React from 'react';

const WhatIsSfis = () => {
  return (
    <section className="py-20 bg-theme-surface2 border-y border-theme relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">What is SFIS?</h2>
          <h3 className="text-xl md:text-2xl font-medium text-theme-accent mb-6 reveal-on-scroll delay-100">
            The intelligent way to manage your wealth
          </h3>
          <p className="text-lg text-theme-secondary reveal-on-scroll delay-200">
            SFIS is a cloud-native financial intelligence platform that helps users manage income, track expenses, analyse spending, visualize financial trends, receive AI-powered financial insights, and make smarter financial decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Track Everything",
              desc: "Effortlessly manage your income and categorize expenses in one unified dashboard.",
              icon: "💰"
            },
            {
              title: "Analyze Trends",
              desc: "Beautiful, interactive charts that help you visualize your spending habits over time.",
              icon: "📊"
            },
            {
              title: "Smart Insights",
              desc: "AI-powered recommendations that adapt to your financial behaviour and help you save.",
              icon: "🤖"
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-6 sm:p-8 rounded-2xl hover:shadow-theme transition-all duration-300 hover:-translate-y-2 border border-theme bg-theme-surface max-w-[300px] sm:max-w-none mx-auto w-full flex flex-col items-center text-center sm:block sm:text-left"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-theme-elevated flex items-center justify-center text-2xl sm:text-3xl mb-5 sm:mb-6 shadow-sm border border-theme">
                {item.icon}
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-theme-primary mb-2 sm:mb-3">{item.title}</h4>
              <p className="text-theme-secondary text-sm sm:text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSfis;
