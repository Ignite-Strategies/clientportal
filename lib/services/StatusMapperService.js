/**
 * StatusMapperService
 * Single source of truth for mapping WorkPackageItem status
 * 
 * MVP1: Uses item.status directly (owner manually updates via execution hub)
 * Future: Will incorporate WorkCollateral status for automatic status derivation
 */

const STATUS_MAP = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "Needs Review",
  CHANGES_NEEDED: "Changes Requested",
  CHANGES_IN_PROGRESS: "Changes Being Made",
  APPROVED: "Completed"
};

/**
 * Maps a WorkPackageItem to its current status
 * MVP1: Uses item.status directly (owner updates manually in execution hub)
 * 
 * @param {Object} item - WorkPackageItem object
 * @param {Array} workCollateral - Array of WorkCollateral objects (for future use)
 * @returns {"NOT_STARTED" | "IN_PROGRESS" | "IN_REVIEW" | "CHANGES_NEEDED" | "CHANGES_IN_PROGRESS" | "APPROVED"}
 */
export function mapItemStatus(item, workCollateral = []) {
  // MVP1: Use item.status directly (owner manually updates via execution hub)
  // Future: Will incorporate WorkCollateral status logic
  return item.status?.toUpperCase() || "NOT_STARTED";
}

/**
 * Get client-friendly label for a status
 * @param {string} status - Status value
 * @returns {string} Client-friendly label
 */
export function getStatusLabel(status) {
  return STATUS_MAP[status?.toUpperCase()] || STATUS_MAP.NOT_STARTED;
}

export { STATUS_MAP };

