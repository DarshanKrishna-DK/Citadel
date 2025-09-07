import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'citadel' | 'default';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinnerColor = variant === 'citadel' ? 'border-citadel-orange' : 'border-blue-500';

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${spinnerColor} border-2 border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className={`text-center ${
          variant === 'citadel' ? 'text-citadel-light-gray' : 'text-gray-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
};