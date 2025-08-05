import React from 'react';

interface MacOSButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const MacOSButton: React.FC<MacOSButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'macos-button';
  const variantClasses = {
    primary: 'macos-button-primary',
    secondary: 'macos-button-secondary',
    tertiary: 'macos-button-tertiary'
  };
  
  const sizeClasses = {
    small: 'text-sm px-3 py-2',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default MacOSButton; 