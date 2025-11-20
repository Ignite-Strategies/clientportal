/**
 * Status Configuration for Client Portal
 * Client-friendly status labels and styling
 */
export const WORK_STATUS_CONFIG = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-gray-100 text-gray-800"
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800"
  },
  IN_REVIEW: {
    label: "Needs Review",
    color: "bg-yellow-100 text-yellow-800"
  },
  CHANGES_NEEDED: {
    label: "Changes Requested",
    color: "bg-red-100 text-red-800"
  },
  CHANGES_IN_PROGRESS: {
    label: "Changes Being Made",
    color: "bg-purple-100 text-purple-800"
  },
  APPROVED: {
    label: "Completed",
    color: "bg-green-100 text-green-800"
  }
};

/**
 * Get status config for a status string
 * Normalizes status to match config keys
 */
export function getStatusConfig(status) {
  if (!status) return WORK_STATUS_CONFIG.NOT_STARTED;
  
  // Normalize status: uppercase
  const normalized = status.toUpperCase();
  
  return WORK_STATUS_CONFIG[normalized] || WORK_STATUS_CONFIG.NOT_STARTED;
}

