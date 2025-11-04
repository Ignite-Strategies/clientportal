import React, { useState } from 'react';

const PurposeSection = ({ purpose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-gray-800 mb-6">
            <strong>To successfully onboard {purpose.headline}</strong>,{' '}
            {purpose.description}
          </p>
        </div>

        {/* Why This Matters Accordion */}
        <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
          >
            <span className="font-semibold text-gray-900">Why this matters</span>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <ul className="space-y-2">
                {purpose.whyThisMatters.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-ignite-primary mr-3 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PurposeSection;

