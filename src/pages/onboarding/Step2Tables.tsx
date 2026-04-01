import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  seats: number;
}

let tableCounter = 1;

function makeTable(): Table {
  return { id: crypto.randomUUID(), name: `Table ${tableCounter++}`, seats: 2 };
}

/**
 * Step 2 — Mes tables
 * Ajout/suppression de tables avec stepper pour les couverts.
 * Validation : ≥1 table avec seats > 0.
 */
export default function Step2Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([makeTable()]);

  const totalCapacity = tables.reduce((sum, t) => sum + t.seats, 0);

  const addTable = () => setTables(prev => [...prev, makeTable()]);

  const removeTable = (id: string) => setTables(prev => prev.filter(t => t.id !== id));

  const updateSeats = (id: string, delta: number) => {
    setTables(prev => prev.map(t =>
      t.id === id ? { ...t, seats: Math.max(1, t.seats + delta) } : t
    ));
  };

  const updateName = (id: string, name: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  };

  const handleNext = () => {
    // TODO Sprint 4 : POST /api/v1/restaurant/me/tables pour chaque table
    localStorage.setItem('lk_tables', JSON.stringify(tables));
    navigate('/onboarding/hours');
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
          <div key={table.id} className="table-row animate-slide-up">
            {/* Name */}
            <input
              className="form-input"
              style={{ flex: 1, height: '36px', fontSize: '13px' }}
              value={table.name}
              onChange={e => updateName(table.id, e.target.value)}
              placeholder="Nom de la table"
            />

            {/* Seats stepper */}
            <div className="stepper">
              <button
                className="stepper-btn"
                onClick={() => updateSeats(table.id, -1)}
                disabled={table.seats <= 1}
                aria-label="Réduire"
              >—</button>
              <span className="stepper-value">{table.seats}</span>
              <button
                className="stepper-btn"
                onClick={() => updateSeats(table.id, 1)}
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
                onClick={() => removeTable(table.id)}
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

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={() => navigate('/onboarding/link')}>
          ← Retour
        </button>
        <button
          id="btn-step2-next"
          className="btn btn-primary btn-lg"
          disabled={!isValid}
          onClick={handleNext}
        >
          Continuer →
        </button>
      </div>
    </>
  );
}
