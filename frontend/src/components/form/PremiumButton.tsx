import React from 'react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles = {
    primary: 'bg-[#0D7C7C] text-white hover:bg-[#0a6666] active:scale-95 focus-visible:ring-[#0D7C7C]',
    secondary: 'bg-[#5DADE2] text-white hover:bg-[#4A9BC4] active:scale-95 focus-visible:ring-[#5DADE2]',
    success: 'bg-[#4ECDC4] text-white hover:bg-[#3db5b0] active:scale-95 focus-visible:ring-[#4ECDC4]',
    danger: 'bg-[#FF6B6B] text-white hover:bg-[#FF5A5A] active:scale-95 focus-visible:ring-[#FF6B6B]',
    outline: 'border-2 border-[#0D7C7C] text-[#0D7C7C] hover:bg-[#0D7C7C] hover:text-white active:scale-95',
    text: 'text-[#0D7C7C] hover:bg-[#0D7C7C]/10 active:bg-[#0D7C7C]/20',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const fullWidthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${fullWidthStyles} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default PremiumButton;
