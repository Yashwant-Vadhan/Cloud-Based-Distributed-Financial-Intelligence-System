import React from 'react';

const PlatformHighlights = () => {
  const highlights = [
    "Cloud Native",
    "Distributed Microservices",
    "AI Powered",
    "Azure Deployment",
    "Docker Containers",
    "GitHub Actions CI/CD",
    "Infrastructure as Code",
    "REST APIs",
    "FastAPI",
    "Express.js",
    "React",
    "Cosmos DB (MongoDB API)",
    "JWT Authentication"
  ];

  return (
    <section className="py-12 bg-theme-surface border-y border-theme overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h3 className="text-sm font-bold text-theme-muted uppercase tracking-wider">Powered By Modern Technology</h3>
      </div>
      
      {/* Marquee effect container */}
      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {highlights.concat(highlights).map((item, idx) => (
            <span 
              key={idx} 
              className="mx-4 px-6 py-3 rounded-full bg-theme-elevated border border-theme text-theme-primary font-medium shadow-sm hover:border-theme-accent transition-colors cursor-default"
            >
              {item}
            </span>
          ))}
        </div>
        
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
            width: max-content;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
};

export default PlatformHighlights;
