interface IconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  children: React.ReactNode;
}

export function IconBtn({ size = 32, children, className, style, ...rest }: IconBtnProps) {
  return (
    <button
      className={`lk-icon-btn${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
