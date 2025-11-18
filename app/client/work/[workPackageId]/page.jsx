'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import DeliverableItemCard from '@/app/components/DeliverableItemCard';
import StatusBadge from '@/app/components/StatusBadge';
import { getStatusConfig } from '@/app/components/statusConfig';

/**
 * Determine if a phase is complete
 * A phase is complete when all its items have status 'completed'
 */
function isPhaseComplete(phase) {
  if (!phase?.items || phase.items.length === 0) return false;
  return phase.items.every(item => {
    const status = (item.status || '').toLowerCase();
    return status === 'completed' || status === 'complete';
  });
}

/**
 * Get current phase index based on completion logic
 * Returns the first phase that is not complete
 */
function getCurrentPhaseIndex(phases) {
  if (!phases || phases.length === 0) return 0;
  
  for (let i = 0; i < phases.length; i++) {
    if (!isPhaseComplete(phases[i])) {
      return i;
    }
  }
  
  // All phases complete, return last phase
  return phases.length - 1;
}

/**
 * Client Portal Work Package View
 * Shows welcome message, workpackage name, current phase with deliverables
 */
export default function WorkPackageView() {
  const params = useParams();
  const router = useRouter();
  const workPackageId = params.workPackageId;
  
  const [workPackage, setWorkPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/login');
        return;
      }

      if (workPackageId) {
        await loadWorkPackage();
      }
    });

    return () => unsubscribe();
  }, [workPackageId, router]);

  const loadWorkPackage = async () => {
    try {
      console.log('🔄 [WorkPackage] Starting load...', { workPackageId });
      setLoading(true);
      
      const apiUrl = `/api/client/work?workPackageId=${workPackageId}`;
      console.log('🌐 [WorkPackage] Calling API:', apiUrl);
      const response = await api.get(apiUrl);
      
      console.log('📥 [WorkPackage] API Response:', {
        success: response.data?.success,
        hasWorkPackage: !!response.data?.workPackage,
        phasesCount: response.data?.workPackage?.phases?.length || 0,
        response: response.data,
      });
      
      if (response.data?.success && response.data.workPackage) {
        const wp = response.data.workPackage;
        console.log('✅ [WorkPackage] Work package loaded:', {
          id: wp.id,
          title: wp.title,
          phasesCount: wp.phases?.length || 0,
        });
        
        setWorkPackage(wp);
        
        // Get client name from contact or company
        const contactName = wp.contact?.firstName || '';
        const companyName = wp.company?.companyName || '';
        const name = companyName || contactName || 'there';
        setClientName(name);
        
        // Determine current phase based on completion logic
        const phases = wp.phases || [];
        const currentIdx = getCurrentPhaseIndex(phases);
        setCurrentPhaseIndex(currentIdx);
        
        console.log('✅ [WorkPackage] Load complete!', {
          clientName: name,
          currentPhaseIndex: currentIdx,
        });
      } else {
        console.warn('⚠️ [WorkPackage] No work package in response');
      }
    } catch (error) {
      console.error('❌ [WorkPackage] Error loading work package:', error);
      console.error('❌ [WorkPackage] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
    } finally {
      console.log('🏁 [WorkPackage] Load flow complete');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!workPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const phases = workPackage.phases || [];
  const currentPhase = phases[currentPhaseIndex] || null;
  const nextPhaseIndex = currentPhaseIndex + 1;
  const previousPhaseIndex = currentPhaseIndex - 1;
  const nextPhase = phases[nextPhaseIndex] || null;
  const previousPhase = phases[previousPhaseIndex] || null;
  const hasMultiplePhases = phases.length > 1;

  // Get current phase status
  const currentPhaseStatus = currentPhase ? (
    isPhaseComplete(currentPhase) ? 'completed' :
    currentPhase.items?.some(item => {
      const status = (item.status || '').toLowerCase();
      return status === 'in_progress' || status === 'in progress';
    }) ? 'in_progress' : 'not_started'
  ) : 'not_started';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome{clientName ? `, ${clientName}` : ''}!
          </h1>
          <p className="text-xl text-gray-400">
            {workPackage.title || 'Project Overview'}
          </p>
          {workPackage.company?.companyName && (
            <p className="text-sm text-gray-500 mt-2">
              {workPackage.company.companyName}
            </p>
          )}
        </div>

        {/* Current Phase */}
        {currentPhase && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-white">Current Phase</h2>
              <StatusBadge status={currentPhaseStatus} />
            </div>
            
            {/* Phase Info */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-4">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {currentPhase.name}
                </h3>
                {currentPhase.description && (
                  <p className="text-gray-400">{currentPhase.description}</p>
                )}
                {currentPhase.position && (
                  <p className="text-sm text-gray-500 mt-2">
                    Phase {currentPhase.position}
                  </p>
                )}
              </div>

              {/* Deliverables for Current Phase */}
              {currentPhase.items && currentPhase.items.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                    Deliverables
                  </h4>
                  {currentPhase.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg transition ${
                        item.status === 'completed' || item.status === 'complete'
                          ? 'bg-green-900/20 border-green-700/50'
                          : item.status === 'in_progress' || item.status === 'in progress'
                          ? 'bg-blue-900/20 border-blue-700/50'
                          : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <DeliverableItemCard item={item} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No deliverables in this phase</p>
              )}
            </div>
          </div>
        )}

        {/* Phase Navigation */}
        {hasMultiplePhases && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {previousPhase && (
              <button
                onClick={() => {
                  setCurrentPhaseIndex(previousPhaseIndex);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition shadow-lg"
              >
                ← Previous Phase
              </button>
            )}
            
            {nextPhase && (
              <button
                onClick={() => {
                  setCurrentPhaseIndex(nextPhaseIndex);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                Next Phase →
              </button>
            )}

            {phases.length > 2 && (
              <>
                <span className="text-gray-400">or</span>
                <button
                  onClick={() => router.push(`/client/work/${workPackageId}/overview`)}
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg"
                >
                  See Entire Project
                </button>
              </>
            )}
          </div>
        )}

        {/* See Other Phases / See Entire Project CTA */}
        {phases.length > 1 && (
          <div className="mb-8 text-center">
            <button
              onClick={() => router.push(`/client/work/${workPackageId}/overview`)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              {phases.length > 2 ? `See All ${phases.length} Phases` : 'See Other Phases'}
            </button>
            <p className="text-sm text-gray-400 mt-2">
              View complete project overview
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

