/**
 * WorkPackageDashboardService
 * Dashboard brain - computes stats, phases, review items, and CTAs
 */

import { mapItemStatus, ItemStatus } from "./StatusMapperService";

interface WorkPackageItem {
  id: string;
  status: string;
  deliverableLabel: string;
  deliverableDescription?: string;
  workPackagePhaseId: string;
  workCollateral?: WorkCollateral[];
}

interface WorkCollateral {
  id: string;
  status: string;
  type: string;
  title?: string;
  reviewRequestedAt?: Date | string | null;
}

interface WorkPackagePhase {
  id: string;
  name: string;
  position: number;
  description?: string;
  items?: WorkPackageItem[];
}

interface WorkPackage {
  id: string;
  title: string;
  description?: string;
  prioritySummary?: string;
  phases?: WorkPackagePhase[];
  items?: WorkPackageItem[];
}

interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  needsReview: number;
}

/**
 * Compute dashboard statistics from work package items
 */
export function computeDashboardStats(workPackage: WorkPackage): DashboardStats {
  const items = workPackage.items || [];

  const totals: DashboardStats = {
    total: items.length,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    needsReview: 0,
  };

  items.forEach((item) => {
    const status = mapItemStatus(item, item.workCollateral || []);
    
    if (status === "COMPLETED") {
      totals.completed++;
    } else if (status === "IN_PROGRESS") {
      totals.inProgress++;
    } else if (status === "NEEDS_REVIEW") {
      totals.needsReview++;
    } else {
      totals.notStarted++;
    }
  });

  return totals;
}

/**
 * Get items that need client review
 */
export function getNeedsReviewItems(
  workPackage: WorkPackage
): WorkPackageItem[] {
  return (workPackage.items || []).filter((item) => {
    const status = mapItemStatus(item, item.workCollateral || []);
    return status === "NEEDS_REVIEW";
  });
}

/**
 * Determine if a phase is complete
 */
function isPhaseComplete(phase: WorkPackagePhase): boolean {
  if (!phase.items || phase.items.length === 0) return false;
  return phase.items.every((item) => {
    const status = mapItemStatus(item, item.workCollateral || []);
    return status === "COMPLETED";
  });
}

/**
 * Get current phase index based on completion logic
 */
function getCurrentPhaseIndex(phases: WorkPackagePhase[]): number {
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
 * Get phase data (current phase, next phase, current phase items)
 */
export function getPhaseData(workPackage: WorkPackage): {
  currentPhase: WorkPackagePhase | null;
  nextPhase: WorkPackagePhase | null;
  currentPhaseItems: WorkPackageItem[];
} {
  const phases = workPackage.phases || [];
  const items = workPackage.items || [];

  if (phases.length === 0) {
    return {
      currentPhase: null,
      nextPhase: null,
      currentPhaseItems: [],
    };
  }

  const currentPhaseIndex = getCurrentPhaseIndex(phases);
  const currentPhase = phases[currentPhaseIndex] || null;
  const nextPhaseIndex = currentPhaseIndex + 1;
  const nextPhase = phases[nextPhaseIndex] || null;

  // Get items for current phase
  const currentPhaseItems =
    currentPhase && currentPhase.id
      ? items.filter((item) => item.workPackagePhaseId === currentPhase.id)
      : [];

  return {
    currentPhase,
    nextPhase,
    currentPhaseItems,
  };
}

/**
 * Compute dashboard CTA text based on project state
 */
export function computeDashboardCTA(totals: DashboardStats): string {
  if (totals.needsReview > 0) {
    return "You Have Work to Review";
  }
  if (totals.inProgress > 0) {
    return "Continue Your Work";
  }
  return "Start Next Deliverable";
}

