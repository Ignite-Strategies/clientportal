import React from 'react';

const CLESpotlight = ({ cleData }) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-purple-200">
          {/* Icon */}
          <div className="text-5xl mb-4">🎓</div>

          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            CLE Initiative — "{cleData.title}"
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {cleData.description}
          </p>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 mb-6">
            <p className="text-gray-800 font-medium">
              {cleData.value}
            </p>
          </div>

          {/* Deliverable */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Deliverable:</h3>
            <p className="text-gray-700">{cleData.deliverable}</p>
          </div>

          {/* Future: Preview Link */}
          <div className="mt-6">
            <button className="text-ignite-primary hover:text-ignite-secondary font-semibold flex items-center gap-2 transition-colors">
              <span>Preview CLE outline</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CLESpotlight;

