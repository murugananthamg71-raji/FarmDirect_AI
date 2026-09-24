import React from 'react';
import { OrderStatus } from '../types';

export const StatusBadge: React.FC<{ status: OrderStatus | string }> = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-800 border-gray-200';

  switch (status) {
    case 'PLACED':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'CONFIRMED':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'PACKED':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'READY_FOR_PICKUP':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'PICKED_UP':
    case 'IN_TRANSIT':
      colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'DELIVERED':
      colorClasses = 'bg-green-100 text-primary border-green-300 font-bold';
      break;
    case 'CANCELLED':
    case 'REJECTED':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'DEMO_VERIFIED':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {status}
    </span>
  );
};

