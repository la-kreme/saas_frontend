import { useState } from 'react';
import { LayoutGrid, Clock, Code2, Zap, Loader2 } from 'lucide-react';
import { useTourSafe, type TourStep } from '../../contexts/OnboardingTourContext';

// ─── Icon Mapping ────────────────────────────────────────────────────────────

const STEP_ICONS: Record<TourStep['icon'], typeof LayoutGrid> = {
  tables: LayoutGrid,
  hours: Clock,
  widget: Code2,
  activate: Zap,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function TourBanner() {
  const tour = useTourSafe();
  const [activating, setActivating] = useState(false);

  if (!tour?.isActive) return null;

  const { currentStep, step, totalSteps, progress, nextStep, skipTour, completeTour } = tour;
  const Icon = STEP_ICONS[step.icon];
  const isLast = currentStep === totalSteps - 1;

  const handleActivate = async () => {
    setActivating(true);
    try {
      await completeTour();
    } finally {
      setActivating(false);
    }
  };

  return (
    <div
      className="animate-slide-down"
      style={{
        background: 'linear-gradient(135deg, var(--lk-purple-muted) 0%, rgba(237,115,169,0.08) 100%)',
        border: '1px solid var(--lk-border-focus)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '3px',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--lk-purple), var(--lk-purple-light))',
        borderRadius: '0 3px 0 0',
        transition: 'width 0.5s ease',
      }} />

      <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'var(--lk-purple-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} style={{ color: 'var(--lk-purple-light)' }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--lk-purple-light)',
            marginBottom: '4px',
          }}>
            Étape {currentStep + 1} sur {totalSteps}
          </div>
          <div style={{
            fontSize: '16px', fontWeight: 700, marginBottom: '4px',
            color: 'var(--lk-text-primary)',
          }}>
            {step.title}
          </div>
          <div style={{
            fontSize: '13px', color: 'var(--lk-text-secondary)',
            lineHeight: 1.5,
          }}>
            {step.description}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={skipTour}
            style={{ fontSize: '12px', color: 'var(--lk-text-muted)' }}
          >
            Passer le guide
          </button>

          {isLast ? (
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={handleActivate}
              disabled={activating}
            >
              {activating ? (
                <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Activation…</>
              ) : (
                <><Zap size={16} /> Activer les réservations</>
              )}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={nextStep}
            >
              Continuer →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
