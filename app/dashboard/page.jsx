'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import api from '@/lib/api';

/**
 * Dashboard = Hydration Brain (MVP1)
 * 
 * Reads:
 * - contactId from localStorage
 * - contactCompanyId from localStorage
 * 
 * Calls:
 * - GET /api/client/engagement?companyId={contactCompanyId}
 * 
 * UI Behavior:
 * - If no workPackage: "Hi Joel 👋 Your engagement is being prepared."
 * - If workPackage exists: Show title and deliverables list
 * - Link to /work/[artifactId] using first artifact
 */
export default function ClientPortalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workPackage, setWorkPackage] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [hasPendingInvoices, setHasPendingInvoices] = useState(false);

  useEffect(() => {
    // Use onAuthStateChanged to wait for Firebase auth to initialize
    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/login');
        return;
      }

      /**
       * MVP1: Simple hydration
       * 1. Read contactId and contactCompanyId from localStorage
       * 2. Call GET /api/client/engagement?companyId={contactCompanyId}
       * 3. Display work package or empty state
       */
      const hydrateEngagement = async () => {
        try {
          // Read from localStorage
          const contactId = typeof window !== 'undefined' 
            ? localStorage.getItem('clientPortalContactId')
            : null;
          const contactCompanyId = typeof window !== 'undefined' 
            ? localStorage.getItem('clientPortalContactCompanyId')
            : null;
          const storedEmail = typeof window !== 'undefined' 
            ? localStorage.getItem('clientPortalContactEmail')
            : null;

          if (!contactId || !contactCompanyId) {
            console.log('⚠️ No contact session found, redirecting to welcome');
            router.replace('/welcome');
            return;
          }

          // Set contact email for greeting
          if (storedEmail) {
            setContactEmail(storedEmail);
            // Extract first name from email (simple MVP1)
            const firstName = storedEmail.split('@')[0].split('.')[0];
            setContactName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
          }

           // Call engagement endpoint (fetches by contactId internally)
           const engagementResponse = await api.get('/api/client/engagement');
           
           if (engagementResponse.data?.success) {
             setWorkPackage(engagementResponse.data.workPackage);
             // Store company info for display
             if (engagementResponse.data.company) {
               setContactName(engagementResponse.data.company.companyName || contactName);
             }
           }

          // Check for pending invoices (billing summary)
          try {
            const invoicesResponse = await api.get('/api/invoices');
            if (invoicesResponse.data?.success) {
              const invoices = invoicesResponse.data.invoices || [];
              const pending = invoices.some((inv) => inv.status === 'pending');
              setHasPendingInvoices(pending);
            }
          } catch (invoiceError) {
            console.warn('Could not fetch invoices:', invoiceError);
            // Continue - billing summary is optional
          }
        } catch (error) {
          console.error('❌ Dashboard hydration error:', error);
          // Continue - show empty state
        } finally {
          setLoading(false);
        }
      };

      hydrateEngagement();
    });

    return () => unsubscribe();
  }, [router]);

  // Get first artifact ID for linking
  const getFirstArtifactId = () => {
    if (!workPackage || !workPackage.items) return null;
    
    for (const item of workPackage.items) {
      if (item.artifacts && item.artifacts.length > 0) {
        return item.artifacts[0].id;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading dashboard...</p>
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Client Portal</h1>
            </div>
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

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {!workPackage ? (
           // No work package - empty state
           <div className="text-center py-16">
             <h2 className="text-3xl font-bold text-white mb-4">
               {contactName || 'Welcome'} 👋
             </h2>
             <p className="text-xl text-gray-400">
               Your engagement is being prepared.
             </p>
           </div>
         ) : (
           // Work package exists
           <>
             <div className="mb-8">
               <h2 className="text-3xl font-bold text-white mb-2">
                 {workPackage.company?.companyName || contactName || 'Work Package'}
               </h2>
               <p className="text-xl text-gray-400 mb-4">
                 {workPackage.title || 'Active Work Package'}
               </p>
               {workPackage.description && (
                 <p className="text-gray-500">{workPackage.description}</p>
               )}
             </div>

            {/* Billing Summary - Simple block if pending invoices */}
            {hasPendingInvoices && (
              <div className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Billing</h3>
                    <p className="text-gray-400">You have one payment due.</p>
                  </div>
                  <button
                    onClick={() => router.push('/settings/billing')}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            )}

            {/* Deliverables List */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Deliverables</h3>
              </div>
              <div className="p-6">
                {workPackage.items && workPackage.items.length > 0 ? (
                  <div className="space-y-4">
                    {workPackage.items.map((item) => {
                      const firstArtifact = item.artifacts && item.artifacts.length > 0 
                        ? item.artifacts[0] 
                        : null;
                      const hasArtifacts = item.artifacts && item.artifacts.length > 0;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{item.deliverableName}</h4>
                          </div>
                          <div>
                            {hasArtifacts ? (
                              <button
                                onClick={() => router.push(`/work/${firstArtifact.id}`)}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                              >
                                View
                              </button>
                            ) : (
                              <span className="px-4 py-2 text-gray-400 font-semibold">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No deliverables yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
