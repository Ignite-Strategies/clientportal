'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import StatusBadge from '@/app/components/StatusBadge';

/**
 * WorkCollateral Detail View
 * Displays a single workCollateral with its content
 */
export default function CollateralView() {
  const params = useParams();
  const router = useRouter();
  const artifactId = params.artifactId; // Route param name kept for backward compatibility
  
  const [collateral, setCollateral] = useState(null);
  const [workPackageItem, setWorkPackageItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/login');
        return;
      }

      if (artifactId) {
        await loadCollateral();
      }
    });

    return () => unsubscribe();
  }, [artifactId, router]);

  const loadCollateral = async () => {
    try {
      console.log('🔄 [Collateral] Starting load...', { artifactId });
      setLoading(true);
      
      const apiUrl = `/api/client/work/artifacts/${artifactId}`;
      console.log('🌐 [Collateral] Calling API:', apiUrl);
      const response = await api.get(apiUrl);
      
      console.log('📥 [Collateral] API Response:', {
        success: response.data?.success,
        hasCollateral: !!response.data?.collateral,
        collateralType: response.data?.collateral?.type,
        response: response.data,
      });
      
      if (response.data?.success && response.data.collateral) {
        console.log('✅ [Collateral] Collateral loaded:', {
          id: response.data.collateral.id,
          type: response.data.collateral.type,
          title: response.data.collateral.title,
          status: response.data.collateral.status,
        });
        
        setCollateral(response.data.collateral);
        setWorkPackageItem(response.data.workPackageItem);
        
        console.log('✅ [Collateral] Load complete!');
      } else {
        console.warn('⚠️ [Collateral] No collateral in response');
      }
    } catch (error) {
      console.error('❌ [Collateral] Error loading collateral:', error);
      console.error('❌ [Collateral] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
    } finally {
      console.log('🏁 [Collateral] Load flow complete');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading collateral...</p>
        </div>
      </div>
    );
  }

  if (!collateral) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Collateral not found</h2>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collateral Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-white">
              {collateral.title || `Collateral`}
            </h1>
            <StatusBadge status={collateral.status || 'not_started'} />
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300">
              {collateral.type}
            </span>
            {workPackageItem && (
              <span className="text-gray-500">
                From: {workPackageItem.deliverableLabel || 'Deliverable'}
              </span>
            )}
          </div>

          {workPackageItem?.deliverableDescription && (
            <p className="text-lg text-gray-400">{workPackageItem.deliverableDescription}</p>
          )}
        </div>

        {/* Collateral Content */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          {collateral.contentJson ? (
            <div className="prose prose-invert max-w-none">
              <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 overflow-auto">
                {JSON.stringify(collateral.contentJson, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">Content coming soon</p>
            </div>
          )}
        </div>

        {/* Review Status */}
        {(collateral.reviewRequestedAt || collateral.reviewCompletedAt) && (
          <div className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Review Status</h3>
            <div className="space-y-2 text-sm text-gray-400">
              {collateral.reviewRequestedAt && (
                <p>
                  Review requested: {new Date(collateral.reviewRequestedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {collateral.reviewCompletedAt && (
                <p>
                  Review completed: {new Date(collateral.reviewCompletedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

