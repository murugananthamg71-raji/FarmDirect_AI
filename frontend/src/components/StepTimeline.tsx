import React from 'react';
import { OrderStatus } from '../types';
import { CheckCircle2, Clock } from 'lucide-react';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PLACED', label: 'Order Placed' },
  { status: 'CONFIRMED', label: 'Confirmed by Farmer' },
  { status: 'PACKED', label: 'Packed & Ready' },
  { status: 'IN_TRANSIT', label: 'In Transit' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export const StepTimeline: React.FC<{ currentStatus: OrderStatus }> = ({ currentStatus }) => {
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'PACKED':
      case 'READY_FOR_PICKUP': return 2;
      case 'PICKED_UP':
      case 'IN_TRANSIT': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold text-center">
        This order has been {currentStatus.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.status} className="flex-1 text-center relative z-10">
              <div
                className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition ${
                  isDone
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <div
                className={`mt-2 text-xs font-medium max-w-[90px] mx-auto ${
                  isCurrent ? 'text-primary font-bold' : isDone ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

