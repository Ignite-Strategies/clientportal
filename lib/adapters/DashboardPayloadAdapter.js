/**
 * Dashboard Payload Adapter
 * 
 * Adapts server-side WorkPackage → Phase → Item → Status data to client-safe format
 * Never fails silently - always returns a valid, safe object graph
 * 
 * Core Requirements:
 * - Normalize phase objects
 * - Normalize item objects
 * - Fix inconsistent status names
 * - Ensure currentPhase.items always exists
 * - Compute fallback stats if missing
 * - Handle missing fields gracefully
 */

import { mapItemStatus } from '@/lib/services/StatusMapperService';

/**
 * Canonical Status Values (matches IgniteBD execution)
 */
const CANONICAL_STATUSES = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  CHANGES_IN_PROGRESS: 'CHANGES_IN_PROGRESS',
  APPROVED: 'APPROVED',
};

/**
 * Normalize a status value to canonical format
 * @param {string|null|undefined} status - Raw status value
 * @returns {string} Canonical status value
 */
function normalizeStatus(status) {
  if (!status) return CANONICAL_STATUSES.NOT_STARTED;
  
  const normalized = String(status).toUpperCase().trim();
  
  // Map old statuses to new canonical statuses
  const statusMap = {
    'DRAFT': CANONICAL_STATUSES.NOT_STARTED,
    'COMPLETED': CANONICAL_STATUSES.APPROVED,
    'IN_REVIEW': CANONICAL_STATUSES.NEEDS_REVIEW,
    'CHANGES_NEEDED': CANONICAL_STATUSES.CHANGES_IN_PROGRESS,
    'NEEDS_REVIEW': CANONICAL_STATUSES.NEEDS_REVIEW,
    'CHANGES_IN_PROGRESS': CANONICAL_STATUSES.CHANGES_IN_PROGRESS,
    'NOT_STARTED': CANONICAL_STATUSES.NOT_STARTED,
    'IN_PROGRESS': CANONICAL_STATUSES.IN_PROGRESS,
    'APPROVED': CANONICAL_STATUSES.APPROVED,
  };
  
  // Return mapped status or default to NOT_STARTED
  return statusMap[normalized] || CANONICAL_STATUSES.NOT_STARTED;
}

/**
 * Normalize a phase object to client-safe format
 * @param {Object} phase - Raw phase object from server
 * @returns {Object} Normalized phase object
 */
function normalizePhase(phase) {
  if (!phase) {
    console.warn('⚠️ [Adapter] Received null/undefined phase, returning empty phase');
    return {
      id: null,
      name: 'Unknown Phase',
      description: null,
      position: 0,
      status: CANONICAL_STATUSES.NOT_STARTED,
      durationDays: null,
      actualStartDate: null,
      actualEndDate: null,
      items: [],
    };
  }
  
  return {
    id: phase.id || null,
    name: phase.name || 'Untitled Phase',
    description: phase.description || null,
    position: phase.position || 0,
    status: normalizeStatus(phase.status),
    durationDays: phase.durationDays || phase.phaseTotalDuration || null,
    actualStartDate: phase.actualStartDate || null,
    actualEndDate: phase.actualEndDate || null,
    items: Array.isArray(phase.items) ? phase.items : [],
  };
}

/**
 * Normalize an item object to client-safe format
 * @param {Object} item - Raw item object from server
 * @returns {Object} Normalized item object
 */
function normalizeItem(item) {
  if (!item) {
    console.warn('⚠️ [Adapter] Received null/undefined item, returning empty item');
    return {
      id: null,
      deliverableLabel: 'Unknown Item',
      deliverableDescription: null,
      status: CANONICAL_STATUSES.NOT_STARTED,
      workCollateral: [],
      workPackagePhaseId: null,
    };
  }
  
  // Normalize status using StatusMapperService
  const mappedStatus = mapItemStatus(item, item.workCollateral || []);
  
  return {
    id: item.id || null,
    deliverableLabel: item.deliverableLabel || item.itemLabel || 'Untitled Item',
    deliverableDescription: item.deliverableDescription || item.itemDescription || null,
    status: normalizeStatus(mappedStatus),
    workCollateral: Array.isArray(item.workCollateral) ? item.workCollateral : [],
    workPackagePhaseId: item.workPackagePhaseId || null,
  };
}

/**
 * Determine current phase from phases array
 * Current phase = first phase with status NOT_STARTED, IN_PROGRESS, CHANGES_IN_PROGRESS, or NEEDS_REVIEW
 * If none, return last APPROVED phase
 * 
 * @param {Array} phases - Array of normalized phase objects
 * @returns {Object|null} Current phase or null
 */
function determineCurrentPhase(phases) {
  if (!Array.isArray(phases) || phases.length === 0) {
    console.warn('⚠️ [Adapter] No phases provided for current phase determination');
    return null;
  }
  
  // Sort phases by position
  const sortedPhases = [...phases].sort((a, b) => (a.position || 0) - (b.position || 0));
  
  // Find first phase that is not completed
  const activePhases = [
    CANONICAL_STATUSES.NOT_STARTED,
    CANONICAL_STATUSES.IN_PROGRESS,
    CANONICAL_STATUSES.CHANGES_IN_PROGRESS,
    CANONICAL_STATUSES.NEEDS_REVIEW,
  ];
  
  const currentPhase = sortedPhases.find(phase => 
    activePhases.includes(phase.status)
  );
  
  if (currentPhase) {
    return currentPhase;
  }
  
  // If no active phase, return last APPROVED phase
  const approvedPhases = sortedPhases.filter(phase => 
    phase.status === CANONICAL_STATUSES.APPROVED
  );
  
  if (approvedPhases.length > 0) {
    return approvedPhases[approvedPhases.length - 1]; // Last approved phase
  }
  
  // Fallback to first phase
  return sortedPhases[0] || null;
}

/**
 * Compute stats from items array
 * @param {Array} items - Array of normalized item objects
 * @returns {Object} Stats object
 */
function computeStats(items) {
  if (!Array.isArray(items)) {
    console.warn('⚠️ [Adapter] Items is not an array, returning empty stats');
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      needsReview: 0,
      notStarted: 0,
    };
  }
  
  const stats = {
    total: items.length,
    completed: 0,
    inProgress: 0,
    needsReview: 0,
    notStarted: 0,
  };
  
  items.forEach((item) => {
    const status = item.status || CANONICAL_STATUSES.NOT_STARTED;
    
    switch (status) {
      case CANONICAL_STATUSES.APPROVED:
        stats.completed++;
        break;
      case CANONICAL_STATUSES.IN_PROGRESS:
      case CANONICAL_STATUSES.CHANGES_IN_PROGRESS:
        stats.inProgress++;
        break;
      case CANONICAL_STATUSES.NEEDS_REVIEW:
        stats.needsReview++;
        break;
      case CANONICAL_STATUSES.NOT_STARTED:
      default:
        stats.notStarted++;
        break;
    }
  });
  
  return stats;
}

/**
 * Filter items that need review
 * @param {Array} items - Array of normalized item objects
 * @returns {Array} Items needing review
 */
function filterNeedsReviewItems(items) {
  if (!Array.isArray(items)) {
    console.warn('⚠️ [Adapter] Items is not an array, returning empty needsReviewItems');
    return [];
  }
  
  return items.filter((item) => {
    const status = item.status || CANONICAL_STATUSES.NOT_STARTED;
    return status === CANONICAL_STATUSES.NEEDS_REVIEW;
  });
}

/**
 * Adapt server-side dashboard payload to client-safe format
 * NEVER fails silently - always returns a valid object graph
 * 
 * @param {Object} serverData - Raw server response from /api/client/allitems
 * @returns {Object} Adapted client-safe payload
 */
export function adaptDashboardPayload(serverData) {
  if (!serverData) {
    console.error('❌ [Adapter] Server data is null/undefined, returning empty payload');
    return {
      workPackage: {
        id: null,
        title: 'Unknown Work Package',
        description: null,
        prioritySummary: null,
      },
      phases: [],
      items: [],
      needsReviewItems: [],
      currentPhase: null,
      stats: {
        total: 0,
        completed: 0,
        inProgress: 0,
        needsReview: 0,
        notStarted: 0,
      },
      contact: {
        id: null,
        firstName: null,
        lastName: null,
        email: null,
      },
    };
  }
  
  console.log('🔄 [Adapter] Adapting dashboard payload:', {
    hasWorkPackage: !!serverData.workPackage,
    hasCurrentPhase: !!serverData.currentPhase,
    allItemsCount: serverData.allItems?.length || 0,
    needsReviewCount: serverData.needsReviewItems?.length || 0,
  });
  
  // Normalize work package
  const workPackage = {
    id: serverData.workPackage?.id || serverData.workPackageId || null,
    title: serverData.workPackage?.title || 'Untitled Work Package',
    description: serverData.workPackage?.description || null,
    prioritySummary: serverData.workPackage?.prioritySummary || null,
  };
  
  // Normalize all items (from allItems or reconstruct from needsReviewItems + currentPhase.items)
  let allItems = [];
  
  if (serverData.allItems && Array.isArray(serverData.allItems)) {
    // Use allItems if provided
    allItems = serverData.allItems.map(normalizeItem);
  } else {
    // Reconstruct from needsReviewItems + currentPhase.items
    const needsReview = (serverData.needsReviewItems || []).map(normalizeItem);
    const currentPhaseItems = (serverData.currentPhase?.items || []).map(normalizeItem);
    
    // Merge and deduplicate
    const itemMap = new Map();
    [...needsReview, ...currentPhaseItems].forEach(item => {
      if (item.id) {
        itemMap.set(item.id, item);
      }
    });
    allItems = Array.from(itemMap.values());
  }
  
  // Normalize phases
  let phases = [];
  
  if (serverData.currentPhase) {
    // If currentPhase is provided, use it as the only phase
    const normalizedPhase = normalizePhase(serverData.currentPhase);
    // Attach items to phase
    normalizedPhase.items = allItems.filter(item => 
      item.workPackagePhaseId === normalizedPhase.id
    );
    phases = [normalizedPhase];
  } else if (serverData.phases && Array.isArray(serverData.phases)) {
    // If phases array is provided, normalize all phases
    phases = serverData.phases.map(phase => {
      const normalizedPhase = normalizePhase(phase);
      // Attach items to phase
      normalizedPhase.items = allItems.filter(item => 
        item.workPackagePhaseId === normalizedPhase.id
      );
      return normalizedPhase;
    });
  }
  
  // Determine current phase (from normalized phases)
  let currentPhase = determineCurrentPhase(phases);
  
  // Ensure currentPhase.items always exists
  if (currentPhase) {
    if (!Array.isArray(currentPhase.items)) {
      currentPhase.items = allItems.filter(item => 
        item.workPackagePhaseId === currentPhase.id
      );
    }
  } else {
    // If no current phase, create a placeholder
    console.warn('⚠️ [Adapter] No current phase found, creating placeholder');
    currentPhase = {
      id: null,
      name: 'No Active Phase',
      description: null,
      position: 0,
      status: CANONICAL_STATUSES.NOT_STARTED,
      durationDays: null,
      actualStartDate: null,
      actualEndDate: null,
      items: [],
    };
  }
  
  // Filter needs review items
  const needsReviewItems = filterNeedsReviewItems(allItems);
  
  // Compute stats (use provided stats or compute from items)
  const stats = serverData.stats && typeof serverData.stats === 'object'
    ? {
        total: serverData.stats.total ?? allItems.length,
        completed: serverData.stats.completed ?? 0,
        inProgress: serverData.stats.inProgress ?? 0,
        needsReview: serverData.stats.needsReview ?? needsReviewItems.length,
        notStarted: serverData.stats.notStarted ?? 0,
      }
    : computeStats(allItems);
  
  // Normalize contact
  const contact = {
    id: serverData.contact?.id || null,
    firstName: serverData.contact?.firstName || null,
    lastName: serverData.contact?.lastName || null,
    email: serverData.contact?.email || null,
  };
  
  const adapted = {
    workPackage,
    phases,
    items: allItems, // ALL items
    needsReviewItems,
    currentPhase,
    stats,
    contact,
  };
  
  console.log('✅ [Adapter] Adapted payload:', {
    workPackageId: adapted.workPackage.id,
    phasesCount: adapted.phases.length,
    itemsCount: adapted.items.length,
    needsReviewCount: adapted.needsReviewItems.length,
    currentPhaseId: adapted.currentPhase?.id,
    stats: adapted.stats,
  });
  
  return adapted;
}

export { normalizeStatus, normalizePhase, normalizeItem, determineCurrentPhase, computeStats };

