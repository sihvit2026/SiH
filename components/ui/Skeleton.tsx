import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`bg-slate-200 animate-pulse ${variantStyles[variant]} ${className}`}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};
