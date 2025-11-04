import React, { useState } from 'react';

const FeedbackBox = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      // Future: API call to backend
      console.log('Feedback submitted:', feedback);
      setSubmitted(true);
      setFeedback('');
      
      // Show toast
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need to clarify or adjust something?
          </h3>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback or questions..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ignite-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-ignite-primary text-white font-semibold rounded-lg hover:bg-ignite-secondary transition-colors"
            >
              Send Feedback
            </button>
          </form>

          {/* Toast Notification */}
          {submitted && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg animate-fade-in">
              ✅ Feedback received — we'll review shortly.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackBox;

