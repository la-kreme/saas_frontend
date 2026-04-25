interface AvatarProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

function hashHue(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ name, size = 32, style }: AvatarProps) {
  const hue = hashHue(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: `oklch(0.92 0.06 ${hue})`,
        color: `oklch(0.4 0.08 ${hue})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.38,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
    >
      {initials(name)}
    </div>
  );
}
