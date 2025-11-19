/**
 * StatusMapperService
 * Single source of truth for mapping WorkPackageItem status based on item and workCollateral
 */

/**
 * Maps a WorkPackageItem to its current status based on item status and workCollateral
 * Priority: NEEDS_REVIEW > COMPLETED > IN_PROGRESS > NOT_STARTED
 * 
 * @param {Object} item - WorkPackageItem object
 * @param {Array} workCollateral - Array of WorkCollateral objects
 * @returns {"NOT_STARTED" | "IN_PROGRESS" | "NEEDS_REVIEW" | "COMPLETED"}
 */
export function mapItemStatus(item, workCollateral = []) {
  // If no collateral, use item.status
  if (!workCollateral.length) {
    return item.status?.toUpperCase() || "NOT_STARTED";
  }

  const statuses = workCollateral.map(
    c => (c.status || "NOT_STARTED").toUpperCase()
  );

  if (statuses.includes("NEEDS_REVIEW")) return "NEEDS_REVIEW";
  if (statuses.includes("IN_PROGRESS")) return "IN_PROGRESS";
  if (statuses.every(s => s === "COMPLETED")) return "COMPLETED";

  return "NOT_STARTED";
}

