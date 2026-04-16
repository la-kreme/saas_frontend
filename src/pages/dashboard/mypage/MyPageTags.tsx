import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { BrunchPlaceDetail, BrunchPlaceUpdate } from '../../../lib/types';

// ─── Tag definitions ──────────────────────────────────────────────────────────

interface TagGroup {
  title: string;
  emoji: string;
  tags: { key: string; label: string }[];
}

const TAG_GROUPS: TagGroup[] = [
  {
    title: 'Qualité & Origine',
    emoji: '🌿',
    tags: [
      { key: 'food_fait_maison', label: 'Fait maison' },
      { key: 'food_bio', label: 'Bio' },
      { key: 'food_local', label: 'Local' },
      { key: 'food_saison', label: 'De saison' },
      { key: 'food_frais', label: 'Frais' },
      { key: 'food_healthy', label: 'Healthy' },
      { key: 'food_comfort_food', label: 'Comfort food' },
      { key: 'food_gastronomique', label: 'Gastronomique' },
      { key: 'food_genereux', label: 'Généreux' },
      { key: 'food_createur', label: 'Créateur' },
      { key: 'food_traditionnel', label: 'Traditionnel' },
      { key: 'food_patisserie', label: 'Pâtisserie' },
      { key: 'food_specialty_coffee', label: 'Specialty Coffee' },
      { key: 'food_zero_dechet', label: 'Zéro déchet' },
    ],
  },
  {
    title: 'Format du brunch',
    emoji: '🍽️',
    tags: [
      { key: 'format_buffet', label: 'Buffet' },
      { key: 'format_a_la_carte', label: 'À la carte' },
      { key: 'format_formule', label: 'Formule' },
      { key: 'format_a_composer', label: 'À composer' },
      { key: 'format_all_day', label: 'All day' },
      { key: 'format_dominical', label: 'Dominical' },
      { key: 'format_a_theme', label: 'À thème' },
      { key: 'format_show_cooking', label: 'Show cooking' },
    ],
  },
  {
    title: 'Cuisine',
    emoji: '🌍',
    tags: [
      { key: 'cuisine_americaine', label: 'Américaine' },
      { key: 'cuisine_italienne', label: 'Italienne' },
      { key: 'cuisine_mediterraneenne', label: 'Méditerranéenne' },
      { key: 'cuisine_orientale', label: 'Orientale' },
      { key: 'cuisine_asiatique', label: 'Asiatique' },
      { key: 'cuisine_latino', label: 'Latino' },
      { key: 'cuisine_brasserie', label: 'Brasserie' },
      { key: 'cuisine_street_food', label: 'Street food' },
      { key: 'cuisine_halal', label: 'Halal' },
    ],
  },
  {
    title: 'Régimes alimentaires',
    emoji: '🥗',
    tags: [
      { key: 'diet_vegan', label: 'Vegan' },
      { key: 'diet_vegetarian', label: 'Végétarien' },
      { key: 'diet_gluten_free', label: 'Sans gluten' },
      { key: 'diet_lactose_free', label: 'Sans lactose' },
      { key: 'diet_flexitarien', label: 'Flexitarien' },
    ],
  },
  {
    title: 'Ambiance',
    emoji: '✨',
    tags: [
      { key: 'atmo_cosy', label: 'Cosy' },
      { key: 'atmo_instagrammable', label: 'Instagrammable' },
      { key: 'atmo_family_friendly', label: 'Familial' },
      { key: 'atmo_quiet', label: 'Calme' },
      { key: 'atmo_trendy', label: 'Tendance' },
      { key: 'atmo_student_friendly', label: 'Étudiants' },
    ],
  },
  {
    title: 'Services',
    emoji: '🛎️',
    tags: [
      { key: 'svc_terrace', label: 'Terrasse' },
      { key: 'svc_wifi', label: 'WiFi' },
      { key: 'svc_reservation', label: 'Réservation' },
      { key: 'svc_takeaway', label: 'À emporter' },
      { key: 'svc_dog_friendly', label: 'Dog friendly' },
      { key: 'svc_baby_friendly', label: 'Baby friendly' },
      { key: 'venue_salon_de_the', label: 'Salon de thé' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  data: BrunchPlaceDetail;
  onSave: (updates: Partial<BrunchPlaceUpdate>) => Promise<void>;
  saving: boolean;
}

export default function MyPageTags({ data, onSave, saving }: Props) {
  const [tags, setTags] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Initialize tag values from data
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    TAG_GROUPS.forEach(group => {
      group.tags.forEach(tag => {
        initial[tag.key] = (data as unknown as Record<string, boolean>)[tag.key] || false;
      });
    });
    setTags(initial);
  }, [data]);

  const toggleTag = (key: string) => {
    setTags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    await onSave(tags);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activeCount = Object.values(tags).filter(Boolean).length;

  return (
    <div className="flex-col gap-6">
      {/* Header with count */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="text-sm text-muted">
          {activeCount} tag{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {TAG_GROUPS.map(group => (
        <div key={group.title} className="card flex-col gap-3">
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
            {group.emoji} {group.title}
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {group.tags.map(tag => {
              const isActive = tags[tag.key] || false;
              return (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => toggleTag(tag.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${isActive ? 'var(--lk-purple)' : 'var(--lk-border)'}`,
                    background: isActive ? 'var(--lk-purple-muted)' : 'var(--lk-surface-2)',
                    color: isActive ? 'var(--lk-purple-light)' : 'var(--lk-text-secondary)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isActive && '✓ '}{tag.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save */}
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start' }}
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Enregistrement...</>
          : saved ? <>&#x2705; Enregistré</>
          : <><Save size={14} /> Enregistrer les tags</>
        }
      </button>
    </div>
  );
}
