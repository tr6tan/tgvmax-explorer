import React from 'react';

interface MacOSBadgeProps {
  children: React.ReactNode;
  variant?: 'count' | 'text' | 'indicator';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const MacOSBadge: React.FC<MacOSBadgeProps> = ({
  children,
  variant = 'count',
  size = 'medium',
  className = ''
}) => {
  const baseClasses = 'macos-badge';
  const variantClasses = {
    count: 'macos-badge-count',
    text: 'macos-badge-text',
    indicator: 'macos-badge-indicator'
  };
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default MacOSBadge; 