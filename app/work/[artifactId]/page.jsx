'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

/**
 * Work Artifact View (MVP1)
 * 
 * Simple placeholder page for viewing artifacts
 * Links from dashboard use first artifact ID
 */
export default function WorkArtifactPage() {
  const router = useRouter();
  const params = useParams();
  const artifactId = params?.artifactId;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/login');
        return;
      }

      // MVP1: Simple placeholder
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, artifactId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading artifact...</p>
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
              onClick={() => router.push('/dashboard')}
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Ignite"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-sm font-semibold text-gray-300">Ignite</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Artifact View</h1>
          <p className="text-gray-400">
            Artifact ID: {artifactId}
          </p>
          <p className="text-gray-400 mt-4">
            Full artifact viewing coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}

