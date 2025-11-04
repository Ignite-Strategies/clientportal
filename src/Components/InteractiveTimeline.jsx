import React, { useState } from 'react';
import MilestoneModal from './MilestoneModal';

const InteractiveTimeline = ({ timeline, onMilestoneHover, hoveredWeek }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const getPhaseColor = (color) => {
    const colors = {
      red: {
        bg: 'bg-red-500',
        light: 'bg-red-100',
        border: 'border-red-500'
      },
      yellow: {
        bg: 'bg-yellow-500',
        light: 'bg-yellow-100',
        border: 'border-yellow-500'
      },
      purple: {
        bg: 'bg-purple-500',
        light: 'bg-purple-100',
        border: 'border-purple-500'
      }
    };
    return colors[color] || colors.red;
  };

  const handleNodeClick = (milestone) => {
    setSelectedMilestone(milestone);
    if (onMilestoneHover) {
      onMilestoneHover(milestone.week);
    }
  };

  return (
    <>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Interactive Timeline
          </h2>

          {/* Timeline Track */}
          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gray-300"></div>

            {/* Timeline Nodes */}
            <div className="relative flex justify-between items-start">
              {timeline.map((milestone, index) => {
                const colors = getPhaseColor(milestone.phaseColor);
                const isHighlighted = hoveredWeek === milestone.week;
                const isFirstInPhase = index === 0 || timeline[index - 1].phase !== milestone.phase;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                    style={{ maxWidth: '12.5%' }}
                  >
                    {/* Phase Label (if first in phase) */}
                    {isFirstInPhase && (
                      <div className="mb-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.light} text-gray-800`}>
                          {milestone.phase}
                        </span>
                      </div>
                    )}

                    {/* Node */}
                    <button
                      onClick={() => handleNodeClick(milestone)}
                      onMouseEnter={() => onMilestoneHover && onMilestoneHover(milestone.week)}
                      onMouseLeave={() => onMilestoneHover && onMilestoneHover(null)}
                      className={`relative z-10 w-12 h-12 rounded-full ${colors.bg} text-white font-bold text-lg shadow-lg hover:scale-110 transition-all cursor-pointer ${
                        isHighlighted ? 'ring-4 ring-offset-2 ring-ignite-primary scale-110' : ''
                      }`}
                    >
                      {milestone.week}
                    </button>

                    {/* Week Label */}
                    <div className="mt-3 text-center">
                      <p className="text-sm font-semibold text-gray-900">Week {milestone.week}</p>
                      <p className="text-xs text-gray-600 mt-1">{milestone.milestone}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone Details (Mobile-friendly list) */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {timeline.map((milestone, index) => (
              <button
                key={index}
                onClick={() => handleNodeClick(milestone)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  hoveredWeek === milestone.week
                    ? 'border-ignite-primary bg-ignite-primary/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${getPhaseColor(milestone.phaseColor).bg}`}></span>
                  <span className="text-sm font-semibold text-gray-900">Week {milestone.week}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{milestone.milestone}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{milestone.deliverable}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Milestone Modal */}
      {selectedMilestone && (
        <MilestoneModal
          milestone={selectedMilestone}
          isOpen={!!selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </>
  );
};

export default InteractiveTimeline;

