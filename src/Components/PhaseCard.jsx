import React, { useState } from 'react';

const PhaseCard = ({ phase, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        accent: 'bg-red-100',
        hover: 'hover:bg-red-100'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        accent: 'bg-yellow-100',
        hover: 'hover:bg-yellow-100'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        accent: 'bg-purple-100',
        hover: 'hover:bg-purple-100'
      }
    };
    return colors[color] || colors.red;
  };

  const colors = getColorClasses(phase.color);

  return (
    <div
      className={`${colors.bg} ${colors.border} border-2 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'shadow-md hover:shadow-lg'}`}
    >
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-5 ${colors.hover} transition-colors text-left`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.accent} ${colors.text}`}>
                PHASE {phase.id}: {phase.name.toUpperCase()}
              </span>
              <span className="text-sm font-medium text-gray-600">Weeks {phase.weeks}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{phase.name}</h3>
            <p className="text-gray-700">{phase.goal}</p>
          </div>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform flex-shrink-0 ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 py-5 bg-white border-t-2 border-gray-200">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Deliverables:</h4>
            <ul className="space-y-2">
              {phase.deliverables.map((deliverable, idx) => (
                <li key={idx} className="flex items-start">
                  <span className={`${colors.text} mr-2 mt-1`}>✓</span>
                  <span className="text-gray-700">{deliverable}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-900 mb-2">Outcome:</h4>
            <p className="text-gray-700">{phase.outcome}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseCard;

