import React from 'react';

interface ProgressProps {
  value: number; // 0–100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'cyan' | 'magenta' | 'purple' | 'green' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value, max = 100, label, showPercent = true,
  color = 'cyan', size = 'md', className = '',
}) => {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const sizeClasses = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  const colorFill: Record<string, string> = {
    cyan:    'bg-blue-600',
    magenta: 'bg-pink-600',
    purple:  'bg-violet-600',
    green:   'bg-green-600',
    amber:   'bg-amber-500',
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-slate-600">
          {label && <span className="font-medium">{label}</span>}
          {showPercent && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorFill[color] ?? 'bg-blue-600'} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
