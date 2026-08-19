import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: 'cyan' | 'magenta' | 'purple' | 'amber' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glowColor = 'none',
  ...props
}) => {
  const glowStyles = {
    cyan: 'shadow-[0_0_20px_rgba(0,240,255,0.15)] border-cyan-500/30',
    magenta: 'shadow-[0_0_20px_rgba(255,0,127,0.15)] border-pink-500/30',
    purple: 'shadow-[0_0_20px_rgba(157,78,221,0.15)] border-purple-500/30',
    amber: 'shadow-[0_0_20px_rgba(255,183,3,0.15)] border-amber-500/30',
    none: 'border-slate-800/80',
  };

  return (
    <div
      className={`glass-panel rounded-xl p-5 ${glowStyles[glowColor]} ${
        hoverEffect ? 'glass-panel-hover transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mb-4 pb-3 border-b border-slate-800/80 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg font-bold text-slate-100 flex items-center gap-2 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-slate-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={className} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 ${className}`} {...props}>
    {children}
  </div>
);
