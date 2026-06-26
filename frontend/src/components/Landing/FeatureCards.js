import React from 'react';

const features = [
  { title: "Income Management", desc: "Track multiple income sources seamlessly.", icon: "💰", color: "text-green-500", bg: "bg-green-500/10" },
  { title: "Expense Management", desc: "Categorize and manage expenses easily.", icon: "📉", color: "text-red-500", bg: "bg-red-500/10" },
  { title: "Interactive Analytics", desc: "Charts and reports for better understanding.", icon: "📊", color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "AI Financial Intelligence", desc: "Receive AI-powered predictions and recommendations.", icon: "🤖", color: "text-purple-500", bg: "bg-purple-500/10" },
  { title: "Cloud Native", desc: "Runs on Microsoft Azure using distributed microservices.", icon: "☁", color: "text-blue-400", bg: "bg-blue-400/10" },
  { title: "Secure Authentication", desc: "JWT authentication with OTP verification.", icon: "🔒", color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "Fast & Scalable", desc: "Containerized microservices with Docker.", icon: "⚡", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { title: "Multi-language Support", desc: "Supports multiple languages with localization.", icon: "🌍", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Theme Customization", desc: "Personalized application themes.", icon: "🎨", color: "text-pink-500", bg: "bg-pink-500/10" },
  { title: "Responsive", desc: "Works beautifully across desktop and mobile.", icon: "📱", color: "text-indigo-500", bg: "bg-indigo-500/10" }
];

const FeatureCards = () => {
  return (
    <section className="py-16 md:py-24 bg-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">Why Choose SFIS?</h2>
          <p className="text-theme-secondary max-w-2xl mx-auto">Everything you need to take control of your finances, built with enterprise-grade technology.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`glass-panel p-4 rounded-xl border border-theme shadow-sm hover-glow-border transition-all duration-300 hover:-translate-y-2 group reveal-on-scroll delay-${(idx % 5) * 100 + 100} flex flex-col items-center text-center max-w-[260px] sm:max-w-none mx-auto w-full`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${feature.bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <span className={feature.color}>{feature.icon}</span>
              </div>
              <h3 className="text-base font-bold text-theme-primary mb-1.5 group-hover:text-theme-accent transition-colors">{feature.title}</h3>
              <p className="text-theme-secondary text-xs leading-snug">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
