import React from 'react';

interface MacOSCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'glass-secondary';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const MacOSCard: React.FC<MacOSCardProps> = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  onClick
}) => {
  const baseClasses = 'macos-card';
  const variantClasses = {
    default: 'macos-card',
    glass: 'macos-glass',
    'glass-secondary': 'macos-glass-secondary'
  };
  
  const hoverClasses = hover ? 'macos-card-hover' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
};

export default MacOSCard; 