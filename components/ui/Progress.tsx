import React from 'react';

interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'cyan' | 'magenta' | 'purple' | 'green' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = 'cyan',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorGradients = {
    cyan: 'from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(0,240,255,0.5)]',
    magenta: 'from-pink-500 to-rose-500 shadow-[0_0_10px_rgba(255,0,127,0.5)]',
    purple: 'from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(157,78,221,0.5)]',
    green: 'from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(57,255,20,0.5)]',
    amber: 'from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(255,183,3,0.5)]',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-mono text-cyan-400">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorGradients[color]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
