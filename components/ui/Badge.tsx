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
  glow?: boolean; // accepted but ignored
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  glow: _glow = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    cyan:            'bg-blue-50  text-blue-700  border-blue-200',
    magenta:         'bg-pink-50  text-pink-700  border-pink-200',
    purple:          'bg-violet-50 text-violet-700 border-violet-200',
    green:           'bg-green-50 text-green-700 border-green-200',
    amber:           'bg-amber-50 text-amber-700 border-amber-200',
    rose:            'bg-red-50   text-red-700   border-red-200',
    slate:           'bg-slate-100 text-slate-600 border-slate-200',
    // status variants
    registered:      'bg-slate-100 text-slate-600 border-slate-200',
    round1_pending:  'bg-amber-50  text-amber-700 border-amber-200',
    shortlisted:     'bg-blue-50   text-blue-700  border-blue-200',
    not_shortlisted: 'bg-slate-100 text-slate-500 border-slate-200',
    selected:        'bg-green-50  text-green-700 border-green-200 font-semibold',
    standby:         'bg-violet-50 text-violet-700 border-violet-200',
    not_selected:    'bg-red-50    text-red-700   border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
