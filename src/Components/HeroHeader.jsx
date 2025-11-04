import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroHeader = ({ companyName, dateIssued, duration, status, purposeHeadline }) => {
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🔥</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Proposal</h1>
          </div>
          
          {/* Welcome Note */}
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Thank you for your interest in working with Ignite Strategies. We're pleased to present this proposal for {companyName}.
          </p>

          {/* Purpose Statement */}
          <p className="text-base text-gray-600 mb-8 max-w-3xl mx-auto">
            The following is provided for {companyName} to {purposeHeadline}.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={() => {
                scrollToContent();
                setTimeout(() => {
                  document.getElementById('scope-of-work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-6 py-3 bg-ignite-primary text-white font-semibold rounded-lg hover:bg-ignite-secondary transition-colors"
            >
              Scope of Work
            </button>
            <button
              onClick={() => {
                scrollToContent();
                setTimeout(() => {
                  document.getElementById('compensation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Compensation
            </button>
            <button
              onClick={() => {
                scrollToContent();
                setTimeout(() => {
                  document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Timeline
            </button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span>Issued: {dateIssued}</span>
            <span>·</span>
            <span>Duration: {duration}</span>
            <span>·</span>
            <span>Status: <span className="font-semibold text-gray-700">{status}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
