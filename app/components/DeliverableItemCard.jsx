'use client';

import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';

/**
 * DeliverableItemCard - Individual deliverable item card
 */
export default function DeliverableItemCard({ item }) {
  const router = useRouter();
  
  // Get first workCollateral if available
  const firstCollateral = item.workCollateral && item.workCollateral.length > 0 
    ? item.workCollateral[0] 
    : null;
  const hasCollateral = item.workCollateral && item.workCollateral.length > 0;
  const collateralCount = item.workCollateral?.length || 0;

  const handleView = () => {
    if (hasCollateral && firstCollateral) {
      router.push(`/client/work/collateral/${firstCollateral.id}`);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-750 transition">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold text-white">{item.deliverableName || item.deliverableLabel || 'Deliverable'}</h4>
          <StatusBadge status={item.status || 'not_started'} />
        </div>
        {item.deliverableDescription && (
          <p className="text-sm text-gray-400 mt-1">{item.deliverableDescription}</p>
        )}
        {hasCollateral && (
          <p className="text-xs text-gray-500 mt-1">
            {collateralCount} {collateralCount === 1 ? 'collateral' : 'collateral'} available
          </p>
        )}
      </div>
      <div>
        {hasCollateral ? (
          <button
            onClick={handleView}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            See Deliverable
          </button>
        ) : (
          <span className="px-4 py-2 text-gray-400 font-semibold">
            Not Started
          </span>
        )}
      </div>
    </div>
  );
}

