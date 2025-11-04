import React, { useEffect, useState } from 'react';

const HeroHeader = ({ clientName, companyName, dateIssued, duration, status }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-amber-500 to-violet-600 overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 via-amber-500/90 to-violet-600/90"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo */}
        <div className={`mb-8 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="text-6xl font-bold text-white mb-2">Ignite</div>
          <div className="text-2xl text-white/90">× {companyName}</div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Welcome, {clientName}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-6">
          Proposal prepared for {companyName}
        </p>

        {/* Subtext */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm md:text-base">
          <span>Issued {dateIssued}</span>
          <span>·</span>
          <span>{duration} engagement</span>
          <span>·</span>
          <span>Status: <span className="font-semibold">{status}</span></span>
        </div>

        {/* CTA Scroll Button */}
        <button
          onClick={scrollToContent}
          className="mt-12 animate-bounce text-white/90 hover:text-white transition-colors"
          aria-label="Scroll to proposal"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium mb-2">View Proposal</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HeroHeader;

