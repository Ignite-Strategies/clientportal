import React from 'react';
import { proposalData } from '../data/mockData';
import HeroHeader from '../Components/HeroHeader';

const Proposal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeroHeader companyName={proposalData.client.company} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-lg text-gray-700">
            Proposal content coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Proposal;
