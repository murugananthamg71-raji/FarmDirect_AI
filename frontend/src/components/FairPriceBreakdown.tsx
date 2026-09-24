import React from 'react';
import { DollarSign, ShieldCheck, Info } from 'lucide-react';

interface FairPriceBreakdownProps {
  pricePerUnit: number;
  unit: string;
}

export const FairPriceBreakdown: React.FC<FairPriceBreakdownProps> = ({ pricePerUnit, unit }) => {
  const farmerEarnings = (pricePerUnit * 0.75).toFixed(2);
  const logisticsPlatformFee = (pricePerUnit * 0.25).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-lightbg p-4 rounded-xl border border-green-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Fair Price Transparency Breakdown</span>
        </h4>
        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
          Demo Estimate
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-1 border-b border-green-100">
          <span className="text-gray-600 font-medium">Direct Farmer Net Share (75%):</span>
          <span className="font-bold text-primary">₹{farmerEarnings} / {unit}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-green-100">
          <span className="text-gray-600 font-medium">Logistics & Platform Service (25%):</span>
          <span className="font-bold text-gray-700">₹{logisticsPlatformFee} / {unit}</span>
        </div>

        <div className="flex justify-between items-center pt-1 font-bold text-darktext text-sm">
          <span>Consumer Direct Total Price:</span>
          <span>₹{pricePerUnit.toFixed(2)} / {unit}</span>
        </div>
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-gray-500 pt-1">
        <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <span>No middleman agent cuts or mandi commission markups applied.</span>
      </div>
    </div>
  );
};

