
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-purple-700 text-white hover:bg-purple-800 active:scale-95 shadow-lg shadow-purple-200 dark:shadow-purple-900/20',
    secondary: 'bg-amber-100 text-amber-800 hover:bg-amber-200 active:scale-95 dark:bg-amber-900/30 dark:text-amber-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-lg shadow-rose-200 dark:shadow-rose-900/20',
    ghost: 'hover:bg-purple-50 text-purple-600 active:scale-95 dark:hover:bg-purple-900/20 dark:text-purple-400',
    outline: 'border-2 border-purple-100 hover:border-purple-200 hover:bg-purple-50 text-purple-700 active:scale-95 dark:border-purple-800 dark:hover:bg-purple-900/20 dark:text-purple-300',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm font-bold rounded-xl',
    lg: 'px-8 py-4 text-lg font-black rounded-2xl tracking-tight',
    icon: 'p-2.5 rounded-xl',
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
