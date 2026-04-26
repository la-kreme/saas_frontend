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
    <Card padded={false} className="lk-empty">
      <div className="lk-empty__icon">{icon}</div>
      <h2 className="lk-empty__title">
        {title}
      </h2>
      <p className="lk-empty__desc">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="lk-empty__action">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
