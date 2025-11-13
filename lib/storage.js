/**
 * Client Portal Storage Helper
 * 
 * Centralized localStorage management for client portal session data
 * This is the foundation for all client portal state management
 */

const STORAGE_KEYS = {
  // Contact & Auth
  CONTACT_ID: 'clientPortalContactId',
  CONTACT_EMAIL: 'clientPortalContactEmail',
  CONTACT_COMPANY_ID: 'clientPortalContactCompanyId',
  COMPANY_NAME: 'clientPortalCompanyName',
  COMPANY_HQ_ID: 'clientPortalCompanyHQId',
  FIREBASE_ID: 'firebaseId',
  
  // Proposals & Deliverables
  PROPOSAL_ID: 'clientPortalProposalId',
  INVOICE_ID: 'clientPortalInvoiceId',
  
  // Session
  LAST_ACTIVE: 'clientPortalLastActive',
};

/**
 * Storage Helper Class
 */
class ClientPortalStorage {
  /**
   * Get proposal ID (foundation for everything else)
   */
  getProposalId() {
    return typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.PROPOSAL_ID) 
      : null;
  }

  /**
   * Set proposal ID (start of everything else)
   */
  setProposalId(proposalId) {
    if (typeof window === 'undefined') return;
    if (proposalId) {
      localStorage.setItem(STORAGE_KEYS.PROPOSAL_ID, proposalId);
      this.updateLastActive();
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROPOSAL_ID);
    }
  }

  /**
   * Get invoice ID
   */
  getInvoiceId() {
    return typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.INVOICE_ID) 
      : null;
  }

  /**
   * Set invoice ID
   */
  setInvoiceId(invoiceId) {
    if (typeof window === 'undefined') return;
    if (invoiceId) {
      localStorage.setItem(STORAGE_KEYS.INVOICE_ID, invoiceId);
      this.updateLastActive();
    } else {
      localStorage.removeItem(STORAGE_KEYS.INVOICE_ID);
    }
  }

  /**
   * Get contact ID
   */
  getContactId() {
    return typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.CONTACT_ID) 
      : null;
  }

  /**
   * Set contact ID
   */
  setContactId(contactId) {
    if (typeof window === 'undefined') return;
    if (contactId) {
      localStorage.setItem(STORAGE_KEYS.CONTACT_ID, contactId);
      this.updateLastActive();
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONTACT_ID);
    }
  }

  /**
   * Get contact company ID
   */
  getContactCompanyId() {
    return typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.CONTACT_COMPANY_ID) 
      : null;
  }

  /**
   * Set contact company ID
   */
  setContactCompanyId(companyId) {
    if (typeof window === 'undefined') return;
    if (companyId) {
      localStorage.setItem(STORAGE_KEYS.CONTACT_COMPANY_ID, companyId);
      this.updateLastActive();
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONTACT_COMPANY_ID);
    }
  }

  /**
   * Get all contact session data
   */
  getContactSession() {
    if (typeof window === 'undefined') return null;
    return {
      contactId: this.getContactId(),
      contactEmail: localStorage.getItem(STORAGE_KEYS.CONTACT_EMAIL),
      contactCompanyId: this.getContactCompanyId(),
      companyName: localStorage.getItem(STORAGE_KEYS.COMPANY_NAME),
      companyHQId: localStorage.getItem(STORAGE_KEYS.COMPANY_HQ_ID),
      firebaseId: localStorage.getItem(STORAGE_KEYS.FIREBASE_ID),
    };
  }

  /**
   * Set contact session data (from Step 1 hydration)
   */
  setContactSession(sessionData) {
    if (typeof window === 'undefined') return;
    
    if (sessionData.contactId) {
      this.setContactId(sessionData.contactId);
    }
    if (sessionData.contactEmail) {
      localStorage.setItem(STORAGE_KEYS.CONTACT_EMAIL, sessionData.contactEmail);
    }
    if (sessionData.contactCompanyId) {
      this.setContactCompanyId(sessionData.contactCompanyId);
    }
    if (sessionData.companyName) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_NAME, sessionData.companyName);
    }
    if (sessionData.companyHQId) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_HQ_ID, sessionData.companyHQId);
    }
    if (sessionData.firebaseId) {
      localStorage.setItem(STORAGE_KEYS.FIREBASE_ID, sessionData.firebaseId);
    }
    
    this.updateLastActive();
  }

  /**
   * Get all session data (proposal, invoice, contact)
   */
  getSession() {
    if (typeof window === 'undefined') return null;
    return {
      ...this.getContactSession(),
      proposalId: this.getProposalId(),
      invoiceId: this.getInvoiceId(),
      lastActive: localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE),
    };
  }

  /**
   * Clear all session data
   */
  clear() {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Clear only proposal/invoice data (keep contact session)
   */
  clearProposalData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.PROPOSAL_ID);
    localStorage.removeItem(STORAGE_KEYS.INVOICE_ID);
  }

  /**
   * Update last active timestamp
   */
  updateLastActive() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
  }

  /**
   * Check if session is valid (has contact ID)
   */
  hasValidSession() {
    return !!this.getContactId();
  }
}

// Export singleton instance
export const clientPortalStorage = new ClientPortalStorage();

// Export storage keys for reference
export { STORAGE_KEYS };

