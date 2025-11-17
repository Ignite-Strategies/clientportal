'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import Image from 'next/image';
import api from '@/lib/api';

/**
 * Welcome = Loader Only (MVP1)
 * 
 * No routing logic. No UI decisions. No fetching proposals or work.
 * Just:
 * 1. Get Firebase UID
 * 2. Fetch contact by UID
 * 3. Store in localStorage: contactId, contactCompanyId, contactEmail, firebaseUid
 * 4. Redirect to /dashboard
 */
function WelcomeContent() {
  const router = useRouter();

  useEffect(() => {
    // Use onAuthStateChanged to wait for Firebase auth to initialize
    let routed = false;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Prevent multiple routing calls
      if (routed) return;
      
      if (!firebaseUser) {
        // If no user after a brief delay, redirect to login
        setTimeout(() => {
          if (!auth.currentUser) {
            router.replace('/login');
          }
        }, 1000);
        return;
      }

      // Mark as routed to prevent duplicate calls
      routed = true;

      /**
       * MVP1: Simple loader - just hydrate contact and redirect
       */
      const hydrateAndRedirect = async () => {
        try {
          // Fetch contact by Firebase UID
          const hydrationResponse = await api.get(`/api/client/hydrate`);
          
          if (hydrationResponse.data?.success && hydrationResponse.data.data) {
            const contact = hydrationResponse.data.data.contact;
            const firebaseUid = firebaseUser.uid;
            
            // Store in localStorage (MVP1 - simple storage)
            if (typeof window !== 'undefined') {
              localStorage.setItem('clientPortalContactId', contact.id);
              localStorage.setItem('clientPortalContactCompanyId', contact.contactCompanyId || '');
              localStorage.setItem('clientPortalContactEmail', contact.email || '');
              localStorage.setItem('firebaseId', firebaseUid);
            }
            
            console.log('✅ Contact hydrated (MVP1):', {
              contactId: contact.id,
              contactCompanyId: contact.contactCompanyId,
            });
            
            // Redirect to dashboard
            router.replace('/dashboard');
          } else {
            console.error('❌ Failed to hydrate contact');
            router.replace('/login');
          }
        } catch (error) {
          console.error('❌ Welcome loader error:', error);
          router.replace('/login');
        }
      };

      hydrateAndRedirect();
    });

    return () => unsubscribe();
  }, [router]);

  // Show minimal loading state while routing
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
