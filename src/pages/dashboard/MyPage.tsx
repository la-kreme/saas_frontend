import { useState, useEffect, useCallback } from 'react';
import { Building, FileText, Image, Tags, Loader2, AlertTriangle } from 'lucide-react';
import { getMyPlace, updateMyPlace } from '../../lib/backendApi';
import { getErrorMessage } from '../../lib/api';
import type { BrunchPlaceDetail, BrunchPlaceUpdate } from '../../lib/types';
import MyPageIdentity from './mypage/MyPageIdentity';
import MyPageContent from './mypage/MyPageContent';
import MyPageMedia from './mypage/MyPageMedia';
import MyPageTags from './mypage/MyPageTags';

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
      <div className="animate-slide-up" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div className="card flex-col gap-4" style={{ textAlign: 'center', padding: '40px' }}>
          <AlertTriangle size={40} style={{ color: 'var(--lk-warning)', margin: '0 auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
            Fiche introuvable
          </h2>
          <p className="text-muted text-sm">
            {error || "Votre compte n'est pas encore lié à un établissement. Complétez l'onboarding pour commencer."}
          </p>
          <button className="btn btn-primary" onClick={fetchData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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

      {/* Tab content */}
      <div style={{ maxWidth: '680px' }}>
        {activeTab === 'identity' && <MyPageIdentity data={data} onSave={handleSave} saving={saving} />}
        {activeTab === 'content' && <MyPageContent data={data} onSave={handleSave} saving={saving} />}
        {activeTab === 'media' && <MyPageMedia data={data} onSave={handleSave} saving={saving} />}
        {activeTab === 'tags' && <MyPageTags data={data} onSave={handleSave} saving={saving} />}
      </div>
    </div>
  );
}
