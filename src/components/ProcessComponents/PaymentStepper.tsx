import React from 'react';
import { Check } from 'lucide-react';

interface PaymentStepperProps {
  currentStep?: number;
}

export const PaymentStepper: React.FC<PaymentStepperProps> = ({ currentStep = 4 }) => {
  const steps = [
    { id: 1, name: 'Select seat(s)', label: 'Finish' },
    { id: 2, name: 'Food', label: 'Finish' },
    { id: 3, name: 'Checkout', label: 'Finish' },
    { id: 4, name: 'Pay', label: 'Step4' },
    { id: 5, name: 'Detail', label: 'Step5' },
  ];

  return (
    <div className="w-full bg-[#0d121c] border-b border-gray-800/80 px-6 py-3 flex items-center justify-center text-xs">
      <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto py-1">
        {steps.map((step, idx) => {
          const isFinished = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-center gap-3 whitespace-nowrap">
              {/* Finished Step */}
              {isFinished && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1e2330] border border-gray-600 flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-gray-400 font-medium leading-none">{step.label}</span>
                    <span className="text-xs text-gray-200 font-semibold">{step.name}</span>
                  </div>
                </div>
              )}

              {/* Current Active Step (Red) */}
              {isCurrent && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#e50914] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-red-900/40">
                    {step.id}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-[#e50914] font-bold leading-none">{step.label}</span>
                    <span className="text-xs text-white font-bold">{step.name}</span>
                  </div>
                </div>
              )}

              {/* Upcoming Step */}
              {!isFinished && !isCurrent && (
                <div className="flex items-center gap-2 opacity-40">
                  <div className="w-6 h-6 rounded-full border border-gray-500 text-gray-400 flex items-center justify-center text-xs">
                    {step.id}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-gray-400 font-medium leading-none">{step.label}</span>
                    <span className="text-xs text-gray-400">{step.name}</span>
                  </div>
                </div>
              )}

              {idx < steps.length - 1 && (
                <div className="w-8 h-[1px] bg-gray-700/80 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};