import React from 'react';

const MilestoneModal = ({ milestone, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getPhaseColor = (color) => {
    const colors = {
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || colors.red;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Phase Color Strip */}
          <div className={`h-2 ${getPhaseColor(milestone.phaseColor)}`}></div>

          <div className="bg-white px-6 py-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Week {milestone.week}: {milestone.milestone}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800`}>
                  {milestone.phase}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Deliverable:</h4>
              <p className="text-gray-700 leading-relaxed">{milestone.deliverable}</p>
            </div>

            {/* Future: Mark Complete / View Docs buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  View Docs
                </button>
                <button className="flex-1 px-4 py-2 bg-ignite-primary text-white rounded-lg font-medium hover:bg-ignite-secondary transition-colors">
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;

