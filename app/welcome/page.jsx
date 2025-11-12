'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import api from '@/lib/api';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      router.replace('/login');
      return;
    }

    const checkAccess = async () => {
      try {
        // Get contactId from localStorage (set during login)
        const contactId = localStorage.getItem('clientPortalContactId');
        
        if (!contactId) {
          router.replace('/login');
          return;
        }

        // Get proposalId from URL or find proposals for this contact
        const proposalId = searchParams.get('proposalId') || localStorage.getItem('clientPortalProposalId');
        
        if (proposalId) {
          localStorage.setItem('clientPortalProposalId', proposalId);
          
          // Fetch proposal to verify access
          try {
            const response = await api.get(`/api/proposals/${proposalId}/portal`);
            if (response.data?.success) {
              setProposal(response.data.portalData);
              setHasAccess(true);
            }
          } catch (err) {
            console.error('Error fetching proposal:', err);
            // Still allow access - we'll verify on dashboard
            setHasAccess(true);
          }
        } else {
          // No proposal ID - find proposals for this contact
          try {
            const response = await api.get(`/api/contacts/${contactId}/proposals`);
            if (response.data?.success && response.data.proposals?.length > 0) {
              const firstProposal = response.data.proposals[0];
              localStorage.setItem('clientPortalProposalId', firstProposal.id);
              setHasAccess(true);
            } else {
              setHasAccess(true); // Allow access, show empty state
            }
          } catch (err) {
            console.error('Error fetching proposals:', err);
            setHasAccess(true); // Allow access
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, searchParams]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ignite"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="text-sm font-semibold text-gray-300">Ignite</span>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ignite"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="text-sm font-semibold text-gray-300">Ignite</span>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-gray-400 mb-6">
            You need a valid proposal link to access the client portal.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 px-6 py-2 text-white font-semibold transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Ignite"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          priority
        />
        <span className="text-sm font-semibold text-gray-300">Ignite</span>
      </div>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <svg
            className="h-16 w-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 18h1a2 2 0 0 0 0-4H5c-.6 0-1.1.2-1.4.6L3 14"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 12h2a2 2 0 1 1 0-4h-3c-.6 0-1.1.2-1.4.6L21 10"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 18h1a2 2 0 0 1 0-4h-3c-.6 0-1.1.2-1.4.6L21 10"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 14l4-4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10l-4 4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 12l-2 2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 12l2 2"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Your Client Portal
        </h1>
        {proposal && (
          <p className="text-gray-400 mb-2">
            Engagement: <span className="font-semibold text-gray-300">{proposal.client?.company}</span>
          </p>
        )}
        <p className="text-gray-400 mb-8">
          View your proposals, track deliverables, and manage your engagement with Ignite Strategies.
        </p>
        <button
          onClick={handleContinue}
          className="w-full rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 px-6 py-3 text-white font-semibold transition shadow-lg"
        >
          Continue to Dashboard →
        </button>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
