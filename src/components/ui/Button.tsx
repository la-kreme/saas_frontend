import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sky';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--lk-primary)',
    color: 'var(--lk-text-inverse)',
    border: '2px solid transparent',
  },
  secondary: {
    background: 'var(--lk-bg-card)',
    color: 'var(--lk-text-primary)',
    border: '1px solid var(--lk-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--lk-text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--lk-error-tint)',
    color: 'var(--lk-error)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  sky: {
    background: 'var(--lk-secondary-tint)',
    color: 'var(--lk-secondary-strong)',
    border: '1px solid transparent',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 28, padding: '0 10px', fontSize: 'var(--fs-sm)', gap: 6 },
  md: { height: 36, padding: '0 14px', fontSize: 'var(--fs-base)', gap: 8 },
  lg: { height: 44, padding: '0 18px', fontSize: 'var(--fs-md)', gap: 8 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, iconRight, children, style, ...rest }, ref) => (
    <button
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius)',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        fontFamily: 'inherit',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
);

Button.displayName = 'Button';
