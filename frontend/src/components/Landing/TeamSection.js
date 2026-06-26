import React from 'react';

const team = [
  {
    name: "Yashwant Vadhan M",
    role: "Cloud & Distributed Systems Lead",
    image: "/images/profiles/Yashwant Vadhan M.png",
    responsibilities: ["Architecture Design", "Cloud Infrastructure", "Azure", "DevOps", "CI/CD", "System Integration", "Frontend Development", "Landing Page", "React", "Tailwind CSS", "Backend"],
    linkedin: "https://www.linkedin.com/in/yashwant-vadhan-m",
    github: "https://github.com/Yashwant-Vadhan",
    email: "yashuvadhan8231@gmail.com"
  },
  {
    name: "M A Sushil Kumar",
    role: "Backend Engineer",
    image: "/images/profiles/M A Sushil Kumar.png",
    responsibilities: ["Authentication Service", "Expense Service", "REST APIs", "JWT Authentication", "Microservices", "Frontend Development", "UI/UX Design", "Responsive Web Design"],
    linkedin: "https://www.linkedin.com/in/sushil006",
    github: "https://github.com/skoder404",
    email: "sushilmit28@gmail.com"
  },
  {
    name: "Ramesh M",
    role: "AI/ML Engineer",
    image: "/images/profiles/Ramesh M.png",
    responsibilities: ["Financial Prediction Model", "Machine Learning", "FastAPI", "AI Integration"],
    linkedin: "https://www.linkedin.com/in/ramesh-m-91ab32335/",
    github: "https://github.com/ramesh304mit-afk",
    email: "ramesh.meghanathan@gmail.com"
  },
  {
    name: "Rithika G V",
    role: "Frontend Developer",
    image: "/images/profiles/Rithika G V.png",
    responsibilities: ["Frontend Architecture", "UI/UX", "React", "Application Interface"],
    linkedin: "https://www.linkedin.com/in/rithika-gv-635b1b300/",
    github: "https://github.com/RithikaGV",
    email: "rithikagv2006@gmail.com"
  },
  {
    name: "Naveena M S",
    role: "Data & QA Engineer",
    image: "/images/profiles/Naveena M S.png",
    responsibilities: ["Data Handling", "Validation", "Testing", "Quality Assurance"],
    linkedin: "https://www.linkedin.com/in/naveena-ms-2a4741386/",
    github: "https://github.com/naveenams2003",
    email: "naveenams2003@gmail.com"
  }
];

const TeamSection = () => {
  return (
    <section className="py-24 bg-theme-primary">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-sm font-bold text-theme-accent tracking-widest uppercase mb-3">Our Team</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">Meet the minds behind SFIS</h3>
          <p className="text-theme-secondary max-w-2xl mx-auto text-lg">A group of passionate engineers building the future of financial intelligence.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-center">
          {team.map((member, idx) => (
            <div 
              key={idx} 
              className={`glass-panel p-6 rounded-2xl border border-theme shadow-sm hover-glow-border transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center bg-theme-surface w-full h-full group reveal-on-scroll delay-${(idx % 5) * 100 + 100}`}
            >
              <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-theme-accent shadow-md flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover bg-gray-200"
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=random' }}
                />
              </div>
              <h3 className="text-lg font-bold text-theme-primary mb-1">{member.name}</h3>
              <p className="text-theme-accent font-medium text-xs mb-3">{member.role}</p>
              
              <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                {member.responsibilities.map((resp, i) => (
                  <span key={i} className="px-2 py-1 bg-theme-elevated text-theme-secondary text-[10px] rounded border border-theme">
                    {resp}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-col items-center w-full gap-3">
                <div className="flex gap-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="LinkedIn">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:opacity-80 transition-opacity" title="GitHub">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  )}
                </div>
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-xs text-theme-secondary hover:text-theme-accent transition-colors break-all">
                    {member.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
