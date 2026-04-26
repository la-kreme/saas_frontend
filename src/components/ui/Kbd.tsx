interface KbdProps {
  children: React.ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <kbd className="lk-kbd">
      {children}
    </kbd>
  );
}
