'use client';

import { useState, useEffect, useCallback } from 'react';
import { clientPortalStorage } from '@/lib/storage';

/**
 * useClientPortalSession Hook
 * 
 * Foundation hook for client portal state management
 * Manages proposal ID, invoice ID, contact session, etc.
 * 
 * Usage:
 *   const { proposalId, setProposalId, invoiceId, setInvoiceId, contactSession } = useClientPortalSession();
 */
export function useClientPortalSession() {
  // State for proposal ID (foundation for everything else)
  const [proposalId, setProposalIdState] = useState(null);
  
  // State for invoice ID
  const [invoiceId, setInvoiceIdState] = useState(null);
  
  // State for contact session
  const [contactSession, setContactSessionState] = useState(null);
  
  // State for full session
  const [session, setSessionState] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      const storedProposalId = clientPortalStorage.getProposalId();
      const storedInvoiceId = clientPortalStorage.getInvoiceId();
      const storedContactSession = clientPortalStorage.getContactSession();
      const storedSession = clientPortalStorage.getSession();

      setProposalIdState(storedProposalId);
      setInvoiceIdState(storedInvoiceId);
      setContactSessionState(storedContactSession);
      setSessionState(storedSession);
    };

    loadSession();
  }, []);

  // Set proposal ID (with localStorage sync)
  const setProposalId = useCallback((id) => {
    clientPortalStorage.setProposalId(id);
    setProposalIdState(id);
  }, []);

  // Set invoice ID (with localStorage sync)
  const setInvoiceId = useCallback((id) => {
    clientPortalStorage.setInvoiceId(id);
    setInvoiceIdState(id);
  }, []);

  // Set contact session (with localStorage sync)
  const setContactSession = useCallback((sessionData) => {
    clientPortalStorage.setContactSession(sessionData);
    const updated = clientPortalStorage.getContactSession();
    setContactSessionState(updated);
    // Update full session
    setSessionState(clientPortalStorage.getSession());
  }, []);

  // Refresh session from localStorage
  const refreshSession = useCallback(() => {
    const updated = clientPortalStorage.getSession();
    setProposalIdState(updated?.proposalId || null);
    setInvoiceIdState(updated?.invoiceId || null);
    setContactSessionState(clientPortalStorage.getContactSession());
    setSessionState(updated);
  }, []);

  // Clear proposal/invoice data (keep contact session)
  const clearProposalData = useCallback(() => {
    clientPortalStorage.clearProposalData();
    setProposalIdState(null);
    setInvoiceIdState(null);
    setSessionState(clientPortalStorage.getSession());
  }, []);

  // Clear all session data
  const clearSession = useCallback(() => {
    clientPortalStorage.clear();
    setProposalIdState(null);
    setInvoiceIdState(null);
    setContactSessionState(null);
    setSessionState(null);
  }, []);

  // Check if session is valid
  const hasValidSession = useCallback(() => {
    return clientPortalStorage.hasValidSession();
  }, []);

  return {
    // Proposal ID (foundation for everything else)
    proposalId,
    setProposalId,
    
    // Invoice ID
    invoiceId,
    setInvoiceId,
    
    // Contact session
    contactSession,
    setContactSession,
    
    // Full session
    session,
    
    // Helpers
    refreshSession,
    clearProposalData,
    clearSession,
    hasValidSession: hasValidSession(),
  };
}

