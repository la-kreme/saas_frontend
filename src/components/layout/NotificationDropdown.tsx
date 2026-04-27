import { Bell } from 'lucide-react';

interface Props {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function NotificationDropdown({ open, onToggle, onClose }: Props) {
  return (
    <div className="lk-notif-wrap">
      <button
        title="Notifications"
        className="lk-topbar-notif-btn"
        onClick={onToggle}
      >
        <Bell size={16} strokeWidth={1.8} />
        <span className="lk-topbar-notif-dot" />
      </button>

      {open && (
        <>
          <div className="lk-notif-backdrop" onClick={onClose} />
          <div className="lk-notif-dropdown">
            <div className="lk-notif-header">Notifications</div>
            <div className="lk-notif-empty">Aucune notification pour le moment.</div>
          </div>
        </>
      )}
    </div>
  );
}
