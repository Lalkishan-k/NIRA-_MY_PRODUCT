import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, CircleDot } from 'lucide-react';
import { TrackingStep } from '../types';

interface OrderTimelineProps {
  timeline: TrackingStep[];
  currentStatus: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline, currentStatus }) => {
  const getIcon = (status: string, completed: boolean, current: boolean) => {
    if (completed) {
      return <CheckCircle2 className="w-5 h-5 text-white" />;
    }
    if (current) {
      return <CircleDot className="w-5 h-5 text-amber-500 animate-pulse" />;
    }
    return <Clock className="w-4 h-4 text-stone-400" />;
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
      {timeline.map((step, index) => {
        const isCurrent = step.current;
        const isCompleted = step.completed;

        return (
          <div key={index} className="relative flex items-start group">
            {/* Step Marker Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 flex items-center justify-center w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 transition-all ${
                isCompleted
                  ? 'bg-emerald-800 border-emerald-800'
                  : isCurrent
                  ? 'bg-white border-amber-500 ring-4 ring-amber-100'
                  : 'bg-white border-stone-300'
              }`}
            >
              {getIcon(step.status, isCompleted, isCurrent)}
            </div>

            {/* Step Information */}
            <div className="ml-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-amber-900 font-bold'
                      : isCompleted
                      ? 'text-stone-900'
                      : 'text-stone-400'
                  }`}
                >
                  {step.title}
                </h4>
                {step.timestamp && (
                  <span className="text-[11px] text-stone-400">
                    {new Date(step.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isCurrent ? 'text-stone-700' : isCompleted ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
