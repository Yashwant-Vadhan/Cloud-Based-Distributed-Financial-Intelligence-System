import React from 'react';

const technologies = [
  { category: "Frontend", name: "React", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
  { category: "Backend", name: "Node.js", bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-500" },
  { category: "Backend", name: "Express.js", bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-500" },
  { category: "Backend", name: "Python", bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-600" },
  { category: "Backend", name: "FastAPI", bg: "bg-teal-500/10", border: "border-teal-500/20", text: "text-teal-500" },
  { category: "Cloud", name: "Microsoft Azure", bg: "bg-blue-600/10", border: "border-blue-600/20", text: "text-blue-600" },
  { category: "Cloud", name: "Azure Container Apps", bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-600" },
  { category: "Cloud", name: "Azure Bicep", bg: "bg-blue-400/10", border: "border-blue-400/20", text: "text-blue-500" },
  { category: "CI/CD", name: "GitHub Actions", bg: "bg-gray-800/10", border: "border-gray-800/20", text: "text-theme-primary" },
  { category: "Containers", name: "Docker", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
  { category: "Database", name: "Azure Cosmos DB", bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-500" },
  { category: "Database", name: "MongoDB API", bg: "bg-green-600/10", border: "border-green-600/20", text: "text-green-600" },
  { category: "Auth", name: "JWT", bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-500" },
  { category: "Auth", name: "Email OTP", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-500" }
];

const TechStackCards = () => {
  return (
    <section className="py-20 bg-theme-surface2 border-y border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-theme-primary mb-12">Technology Stack</h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          {technologies.map((tech, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${tech.bg} ${tech.border} shadow-sm hover:-translate-y-1 transition-transform duration-300`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${tech.text}`}>
                {tech.category}
              </span>
              <span className="w-1 h-1 rounded-full bg-theme-muted"></span>
              <span className="text-theme-primary font-medium">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackCards;
