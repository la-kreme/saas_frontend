import { useState } from 'react';
import Step2Tables from '../../pages/onboarding/Step2Tables';
import Step3Hours from '../../pages/onboarding/Step3Hours';
import { getMyConfig, updateMyConfig, activateWidget, getErrorMessage } from '../../lib/api';
import { Zap, Loader2 } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setActivating(true);
    setError('');
    try {
      await updateMyConfig({ show_on_directory: true });
      await activateWidget();
      onComplete();
    } catch (err) {
      setError(getErrorMessage(err, "Erreur d'activation."));
    } finally {
      setActivating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--lk-surface)', width: '100%', maxWidth: '560px',
        borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden'
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {step === 1 && (
            <Step2Tables onNext={() => setStep(2)} hideBack />
          )}
          {step === 2 && (
            <Step3Hours onBack={() => setStep(1)} onNext={() => setStep(3)} />
          )}
          {step === 3 && (
            <>
              <div className="onboarding-step-header">
                <div className="onboarding-step-number">Dernière étape</div>
                <h1 className="onboarding-step-title">C'est terminé !</h1>
                <p className="onboarding-step-desc">
                  Votre logiciel est configuré. Activez maintenant les réservations.
                </p>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '24px' }}
                disabled={activating}
                onClick={handleActivate}
              >
                {activating ? <><Loader2 size={16} className="animate-spin" /> Activation...</> : <><Zap size={16} /> Activer les réservations</>}
              </button>
              {error && <p className="form-error" style={{ marginTop: '12px', textAlign: 'center' }}>{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
