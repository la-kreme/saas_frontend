import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sky';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconRight, children, className, ...rest }, ref) => (
    <button
      ref={ref}
      className={`lk-btn lk-btn--${variant} lk-btn--${size}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
);

Button.displayName = 'Button';
