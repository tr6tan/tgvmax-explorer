import React from 'react';

interface OptimizedLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress';
  text?: string;
  progress?: number;
  showProgress?: boolean;
}

const OptimizedLoadingSpinner: React.FC<OptimizedLoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'spinner',
  text,
  progress,
  showProgress = false
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses.small} bg-blue-600 rounded-full animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`} />
        );
      
      case 'progress':
        return (
          <div className="w-full max-w-xs">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            {showProgress && progress !== undefined && (
              <div className="text-center mt-2 text-sm text-gray-600">
                {Math.round(progress)}%
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {renderSpinner()}
      {text && (
        <div className={`mt-3 text-center ${textSizes[size]} text-gray-600 font-medium`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default OptimizedLoadingSpinner;
