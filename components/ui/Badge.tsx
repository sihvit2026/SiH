import React from 'react';

export type BadgeVariant = 
  | 'cyan' 
  | 'magenta' 
  | 'purple' 
  | 'green' 
  | 'amber' 
  | 'rose' 
  | 'slate' 
  | 'registered' 
  | 'round1_pending' 
  | 'shortlisted' 
  | 'not_shortlisted' 
  | 'selected' 
  | 'standby' 
  | 'not_selected';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  glow = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    magenta: 'bg-pink-950/60 text-pink-300 border-pink-500/40',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    green: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    slate: 'bg-slate-900 text-slate-400 border-slate-700',

    // Team Status mapped variants
    registered: 'bg-slate-900 text-slate-300 border-slate-700',
    round1_pending: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    shortlisted: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60',
    not_shortlisted: 'bg-slate-950 text-slate-500 border-slate-800',
    selected: 'bg-emerald-950/90 text-emerald-300 border-emerald-400/80 font-bold',
    standby: 'bg-purple-950/90 text-purple-300 border-purple-400/70',
    not_selected: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
  };

  const glowStyles: Partial<Record<BadgeVariant, string>> = {
    cyan: 'shadow-[0_0_8px_rgba(0,240,255,0.4)]',
    magenta: 'shadow-[0_0_8px_rgba(255,0,127,0.4)]',
    purple: 'shadow-[0_0_8px_rgba(157,78,221,0.4)]',
    green: 'shadow-[0_0_8px_rgba(57,255,20,0.4)]',
    selected: 'shadow-[0_0_12px_rgba(57,255,20,0.5)]',
    shortlisted: 'shadow-[0_0_10px_rgba(0,240,255,0.4)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
        variantStyles[variant]
      } ${glow && glowStyles[variant] ? glowStyles[variant] : ''} ${className}`}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};
