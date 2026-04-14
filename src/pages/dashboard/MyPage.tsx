import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, FileText, Image, Tags, Loader2, ShieldCheck, Upload, Clock } from 'lucide-react';
import { getMyPlace, updateMyPlace } from '../../lib/backendApi';
import { getErrorMessage } from '../../lib/api';
import type { BrunchPlaceDetail, BrunchPlaceUpdate } from '../../lib/types';
import MyPageIdentity from './mypage/MyPageIdentity';
import MyPageContent from './mypage/MyPageContent';
import MyPageMedia from './mypage/MyPageMedia';
import MyPageTags from './mypage/MyPageTags';
import { LinkRestaurant } from '../../components/widget/LinkRestaurant';

type TabKey = 'identity' | 'content' | 'media' | 'tags';

const TABS: { key: TabKey; label: string; icon: typeof Building }[] = [
  { key: 'identity', label: 'Identité', icon: Building },
  { key: 'content', label: 'Contenu', icon: FileText },
  { key: 'media', label: 'Médias', icon: Image },
  { key: 'tags', label: 'Tags', icon: Tags },
];

/**
 * Dashboard — Ma page La Krème
 * Allows the restaurateur to edit all visible fields of their lakreme.fr page.
 */
export default function MyPage() {
  const [data, setData] = useState<BrunchPlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('identity');

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const place = await getMyPlace();
      setData(place);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Impossible de charger votre fiche.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setError('');
    try {
      // POST to /api/v1/restaurateur/me/claim
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${import.meta.env.VITE_MEILLEURBRUNCH_API_URL || 'http://localhost:8000'}/api/v1/restaurateur/me/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await import('../../lib/supabase').then(m => m.supabase.auth.getSession())).data.session?.access_token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Erreur lors de la soumission du document');
      
      // Update local state to pending
      setData(prev => prev ? { ...prev, verification_status: 'pending' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setUploadingDoc(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (updates: Partial<BrunchPlaceUpdate>) => {
    if (!data) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateMyPlace(updates);
      setData(updated);
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, 'Erreur lors de la sauvegarde.'));
      throw err; // Let child component handle UI state
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={32} style={{ color: 'var(--lk-purple-light)', animation: 'spin 0.7s linear infinite' }} />
        <p className="text-muted">Chargement de votre fiche…</p>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="card flex-col gap-4" style={{ padding: '40px' }}>
          <LinkRestaurant onLinked={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  const verifyStatus = data.verification_status || 'none';

  // ─── Main content ─────────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Ma page La Krème
        </h1>
        <p className="text-muted text-sm">
          {data.name} · {data.city_name || 'Ville non définie'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--lk-border)',
        paddingBottom: '0',
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--lk-purple)' : 'transparent'}`,
                color: isActive ? 'var(--lk-purple-light)' : 'var(--lk-text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                marginBottom: '-1px',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Save error banner */}
      {saveError && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: 'var(--radius)',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--lk-error, #ef4444)',
        }}>
          {saveError}
        </div>
      )}

      {/* Tab content with Protection Overlay */}
      <div style={{ maxWidth: '680px', position: 'relative' }}>
        {verifyStatus !== 'verified' && (
          <div style={{
            position: 'absolute', inset: -16, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="card flex-col gap-4 animate-slide-up" style={{
              textAlign: 'center', padding: '40px', maxWidth: '480px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: verifyStatus === 'pending' ? '1px solid var(--lk-warning)' : '1px solid var(--lk-purple)'
            }}>
              {verifyStatus === 'pending' ? (
                <>
                  <Clock size={48} style={{ color: 'var(--lk-warning)', margin: '0 auto' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Vérification en cours</h2>
                  <p className="text-muted">
                    Notre équipe examine actuellement votre document Kbis. 
                    Ce processus prend généralement 24 à 48 heures ouvrées.<br/><br/>
                    En attendant, votre page publique La Krème n'est pas modifiable.
                  </p>
                </>
              ) : (
                <>
                  <ShieldCheck size={48} style={{ color: 'var(--lk-purple)', margin: '0 auto' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Revendiquez votre page</h2>
                  <p className="text-muted text-sm">
                    Pour modifier la présentation de votre établissement sur l'annuaire La Krème, vous devez vérifier votre identité.
                    Transmettez un Kbis ou une photo depuis l'intérieur.
                  </p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,application/pdf"
                    onChange={handleDocumentUpload}
                  />
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingDoc}
                    style={{ marginTop: '16px', alignSelf: 'center' }}
                  >
                    {uploadingDoc ? (
                      <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Upload size={16} /> Envoyer le document</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{
          filter: verifyStatus !== 'verified' ? 'grayscale(1) blur(2px)' : 'none',
          opacity: verifyStatus !== 'verified' ? 0.35 : 1,
          pointerEvents: verifyStatus !== 'verified' ? 'none' : 'auto',
          userSelect: verifyStatus !== 'verified' ? 'none' : 'auto',
          transition: 'all 0.3s ease'
        }}>
          {activeTab === 'identity' && <MyPageIdentity data={data} onSave={handleSave} saving={saving} />}
          {activeTab === 'content' && <MyPageContent data={data} onSave={handleSave} saving={saving} />}
          {activeTab === 'media' && <MyPageMedia data={data} onSave={handleSave} saving={saving} />}
          {activeTab === 'tags' && <MyPageTags data={data} onSave={handleSave} saving={saving} />}
        </div>
      </div>
    </div>
  );
}
