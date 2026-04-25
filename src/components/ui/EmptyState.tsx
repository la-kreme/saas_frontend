import { Card } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card
      style={{
        padding: 40,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        background: 'linear-gradient(135deg, var(--lk-primary-soft) 0%, var(--lk-secondary-tint) 100%)',
      }}
    >
      <div style={{ color: 'var(--lk-primary)', marginBottom: 4 }}>{icon}</div>
      <h2 style={{
        fontSize: 'var(--fs-lg)',
        fontWeight: 600,
        color: 'var(--lk-text-primary)',
        margin: 0,
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: 'var(--fs-base)',
        color: 'var(--lk-text-secondary)',
        maxWidth: 360,
        margin: 0,
      }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} style={{ marginTop: 8 }}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
