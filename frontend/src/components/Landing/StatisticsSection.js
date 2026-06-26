import React, { useEffect, useState } from 'react';

const StatisticsSection = () => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('statistics-section');
    if (element) observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const stats = [
    { value: 4, suffix: '', label: 'Container Apps' },
    { value: 1, suffix: '', label: 'Container Registry' },
    { value: 1, suffix: '', label: 'Azure Cosmos DB' }
  ];

  return (
    <section id="statistics-section" className="py-20 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-[80px]" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/20 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className={`p-6 ${idx !== 0 ? 'pt-10 md:pt-6' : ''}`}>
              <div className="text-5xl font-extrabold text-white mb-2 stat-glow flex items-center justify-center">
                {inView ? (
                  <Counter end={stat.value} duration={2000} />
                ) : (
                  "0"
                )}
                {stat.suffix}
              </div>
              <div className="text-blue-100 font-medium text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Simple Counter Component for Animation
const Counter = ({ end, duration }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}</span>;
};

export default StatisticsSection;
