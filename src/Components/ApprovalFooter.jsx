import React, { useState } from 'react';

const ApprovalFooter = ({ onApprove }) => {
  const [isApproved, setIsApproved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleApprove = () => {
    setIsApproved(true);
    setShowConfetti(true);
    
    // Trigger confetti effect
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    if (onApprove) {
      onApprove();
    }

    // Future: API call to backend
    console.log('Proposal approved');
  };

  const handleScheduleWalkthrough = () => {
    // Future: Open calendar/scheduling modal
    alert('Schedule walkthrough functionality will be connected to backend.');
  };

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      {/* Fixed Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 shadow-lg z-40 transition-all ${
        isApproved ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Prepared by <span className="font-semibold text-gray-900">Ignite Strategies</span> – Business Development Division
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleScheduleWalkthrough}
                disabled={isApproved}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isApproved
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Schedule a Walkthrough
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproved}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isApproved
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-ignite-primary text-white hover:bg-ignite-secondary'
                }`}
              >
                {isApproved ? '✅ Proposal Accepted' : 'Approve Proposal →'}
              </button>
            </div>
          </div>

          {isApproved && (
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-green-700">
                ✅ Proposal Accepted — Welcome to Ignite BD.
              </p>
            </div>
          )}
        </div>
      </footer>

      {/* Spacer to prevent content from hiding behind fixed footer */}
      <div className="h-24"></div>
    </>
  );
};

export default ApprovalFooter;

