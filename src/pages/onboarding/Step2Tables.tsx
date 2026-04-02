import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, Loader2 } from 'lucide-react';
import { createTable } from '../../lib/api';

interface LocalTable {
  tempId: string;
  name: string;
  seats: number;
}

let tableCounter = 1;

function makeTable(): LocalTable {
  return { tempId: crypto.randomUUID(), name: `Table ${tableCounter++}`, seats: 2 };
}

/**
 * Step 2 — Mes tables
 * Ajout/suppression de tables avec stepper pour les couverts.
 * Validation : ≥1 table avec seats > 0.
 * Sauvegarde en API : POST /api/v1/restaurant/me/tables pour chaque table.
 */
export default function Step2Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<LocalTable[]>([makeTable()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalCapacity = tables.reduce((sum, t) => sum + t.seats, 0);

  const addTable = () => setTables(prev => [...prev, makeTable()]);
  const removeTable = (tempId: string) => setTables(prev => prev.filter(t => t.tempId !== tempId));

  const updateSeats = (tempId: string, delta: number) => {
    setTables(prev => prev.map(t =>
      t.tempId === tempId ? { ...t, seats: Math.max(1, t.seats + delta) } : t
    ));
  };

  const updateName = (tempId: string, name: string) => {
    setTables(prev => prev.map(t => t.tempId === tempId ? { ...t, name } : t));
  };

  const handleNext = async () => {
    setSaving(true);
    setError('');
    try {
      // Créer toutes les tables en parallèle
      await Promise.all(
        tables.map((t, i) =>
          createTable({ name: t.name, seats: t.seats, display_order: i })
        )
      );
      navigate('/onboarding/hours');
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la sauvegarde des tables.');
    } finally {
      setSaving(false);
    }
  };

  const isValid = tables.length > 0 && tables.every(t => t.seats > 0 && t.name.trim());

  return (
    <>
      <div className="onboarding-step-header">
        <div className="onboarding-step-number">Étape 2 sur 5</div>
        <h1 className="onboarding-step-title">Mes tables</h1>
        <p className="onboarding-step-desc">
          Définissez vos tables. Le système attribue automatiquement
          la table disponible de taille minimale suffisante.
        </p>
      </div>

      {/* Tables list */}
      <div className="flex-col gap-3">
        {tables.map((table) => (
          <div key={table.tempId} className="table-row animate-slide-up">
            {/* Name */}
            <input
              className="form-input"
              style={{ flex: 1, height: '36px', fontSize: '13px' }}
              value={table.name}
              onChange={e => updateName(table.tempId, e.target.value)}
              placeholder="Nom de la table"
            />

            {/* Seats stepper */}
            <div className="stepper">
              <button
                className="stepper-btn"
                onClick={() => updateSeats(table.tempId, -1)}
                disabled={table.seats <= 1}
                aria-label="Réduire"
              >—</button>
              <span className="stepper-value">{table.seats}</span>
              <button
                className="stepper-btn"
                onClick={() => updateSeats(table.tempId, 1)}
                aria-label="Augmenter"
              >+</button>
            </div>

            <span className="text-xs text-muted" style={{ minWidth: '60px', whiteSpace: 'nowrap' }}>
              {table.seats} couv.
            </span>

            {/* Delete */}
            {tables.length > 1 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => removeTable(table.tempId)}
                aria-label="Supprimer"
                style={{ padding: '0 8px', color: 'var(--lk-error)' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add table */}
      <button
        className="btn btn-secondary"
        style={{ marginTop: '12px', width: '100%' }}
        onClick={addTable}
      >
        <Plus size={14} /> Ajouter une table
      </button>

      {/* Capacity summary */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'var(--lk-purple-muted)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Users size={14} style={{ color: 'var(--lk-purple-light)' }} />
        <span className="text-sm" style={{ color: 'var(--lk-purple-light)', fontWeight: 600 }}>
          Capacité totale : {totalCapacity} couverts — {tables.length} table{tables.length > 1 ? 's' : ''}
        </span>
      </div>

      {error && <p className="form-error" style={{ marginTop: '12px' }}>{error}</p>}

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={() => navigate('/onboarding/link')}>
          ← Retour
        </button>
        <button
          id="btn-step2-next"
          className="btn btn-primary btn-lg"
          disabled={!isValid || saving}
          onClick={handleNext}
        >
          {saving
            ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Sauvegarde...</>
            : 'Continuer →'
          }
        </button>
      </div>
    </>
  );
}
