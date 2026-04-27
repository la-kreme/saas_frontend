import { Outlet } from 'react-router-dom';
import { useOnboardingStep } from '../../hooks/useOnboardingStep';

const STEPS = [
  { label: 'Ma fiche' },
  { label: 'Tables' },
  { label: 'Horaires' },
  { label: 'Style' },
  { label: 'Widget' },
];

export function OnboardingLayout() {
  const currentStep = useOnboardingStep();

  return (
    <div className="onboarding-page">
      {/* Logo */}
      <div className="onboarding-logo">
        <img src="/logo.png" alt="Koulis" style={{ height: '48px', width: 'auto' }} />
      </div>

      {/* Step Progress (Hidden on step 1 since it can be skipped) */}
      {currentStep > 0 && (
        <div style={{ width: '100%', maxWidth: '560px', marginBottom: '32px' }} className="animate-fade-in">
          <div className="step-progress">
            {STEPS.map((_, idx) => (
              <div key={idx} className="step-item">
                <div className={`step-circle ${
                  idx < currentStep ? 'completed' :
                  idx === currentStep ? 'active' : ''
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`step-connector ${idx < currentStep ? 'completed' : ''}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex" style={{ justifyContent: 'space-between', marginTop: '8px' }}>
            {STEPS.map((step, idx) => (
              <span key={idx} className="text-xs text-muted" style={{
                flex: 1,
                textAlign: idx === 0 ? 'left' : idx === STEPS.length - 1 ? 'right' : 'center',
                color: idx === currentStep ? 'var(--lk-purple-light)' : undefined,
              }}>
                {step.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="onboarding-card animate-slide-up">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="text-xs text-muted" style={{ marginTop: '24px' }}>
        Koulis · Widget de Réservation · v1.0
      </p>
    </div>
  );
}
