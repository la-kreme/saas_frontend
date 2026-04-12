import { useState, useEffect } from 'react';
import { Save, FileText, Lightbulb } from 'lucide-react';
import type { BrunchPlaceDetail, BrunchPlaceUpdate } from '../../../lib/types';

interface Props {
  data: BrunchPlaceDetail;
  onSave: (updates: Partial<BrunchPlaceUpdate>) => Promise<void>;
  saving: boolean;
}

export default function MyPageContent({ data, onSave, saving }: Props) {
  const [descriptionHtml, setDescriptionHtml] = useState(data.description_html || '');
  const [menuContentHtml, setMenuContentHtml] = useState(data.menu_content_html || '');
  const [excerpt, setExcerpt] = useState(data.excerpt || '');
  const [editorialHighlight, setEditorialHighlight] = useState(data.editorial_highlight || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDescriptionHtml(data.description_html || '');
    setMenuContentHtml(data.menu_content_html || '');
    setExcerpt(data.excerpt || '');
    setEditorialHighlight(data.editorial_highlight || '');
  }, [data]);

  const handleSave = async () => {
    await onSave({
      description_html: descriptionHtml || undefined,
      menu_content_html: menuContentHtml || undefined,
      excerpt: excerpt || undefined,
      editorial_highlight: editorialHighlight || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-col gap-6">
      <div className="card flex-col gap-6">
        {/* Description */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            <FileText size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Description
          </h2>
          <div className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Description de votre établissement</label>
              <textarea
                className="form-input"
                rows={8}
                value={descriptionHtml}
                onChange={e => setDescriptionHtml(e.target.value)}
                placeholder="Décrivez votre établissement, son histoire, ce qui le rend unique..."
                style={{ resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
              />
              <span className="text-xs text-muted">
                Le HTML simple est autorisé (&lt;b&gt;, &lt;i&gt;, &lt;br&gt;, &lt;p&gt;).
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Dans l'assiette (menu / offre)</label>
              <textarea
                className="form-input"
                rows={6}
                value={menuContentHtml}
                onChange={e => setMenuContentHtml(e.target.value)}
                placeholder="Décrivez votre offre brunch : les plats, les spécialités..."
                style={{ resize: 'vertical', minHeight: '100px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Accroche */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
            <Lightbulb size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Accroches
          </h2>
          <div className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Extrait court</label>
              <input
                className="form-input"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Un brunch créatif au cœur de Paris"
                maxLength={200}
              />
              <span className="text-xs text-muted">
                {excerpt.length}/200 caractères — Affiché dans les listes et cartes.
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Point fort éditorial</label>
              <input
                className="form-input"
                value={editorialHighlight}
                onChange={e => setEditorialHighlight(e.target.value)}
                placeholder="🌿 100% fait maison avec des produits locaux"
                maxLength={255}
              />
              <span className="text-xs text-muted">
                {editorialHighlight.length}/255 caractères — Mis en valeur sur votre page.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {descriptionHtml && (
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--lk-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aperçu
          </h3>
          <div
            style={{
              padding: '16px',
              background: 'var(--lk-surface-2)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--lk-text-primary)',
            }}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>
      )}

      {/* Save */}
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start' }}
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Enregistrement...</>
          : saved ? <>&#x2705; Enregistré</>
          : <><Save size={14} /> Enregistrer</>
        }
      </button>
    </div>
  );
}
