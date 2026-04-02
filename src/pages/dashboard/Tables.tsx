import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Loader2, Save } from 'lucide-react';
import { getMyTables, createTable, updateTable, deleteTable } from '../../lib/api';

interface EditableTable {
  id?: string;
  tempId: string;
  name: string;
  seats: number;
  is_active: boolean;
  display_order: number;
}

export default function Tables() {
  const [tables, setTables] = useState<EditableTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Keep track of original state to know what changed
  const [originalTables, setOriginalTables] = useState<EditableTable[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getMyTables();
      const mapped = data.map(t => ({ ...t, tempId: t.id }));
      setTables(mapped);
      setOriginalTables(JSON.parse(JSON.stringify(mapped)));
    } catch (err: any) {
      setError("Impossible de charger les tables");
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = tables.filter(t => t.is_active).reduce((sum, t) => sum + t.seats, 0);

  const addTable = () => {
    setTables(prev => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        name: `Table ${prev.length + 1}`,
        seats: 2,
        is_active: true,
        display_order: prev.length,
      }
    ]);
    setSuccess('');
  };

  const removeTable = (tempId: string, serverId?: string) => {
    setTables(prev => prev.filter(t => t.tempId !== tempId));
    if (serverId) {
      setDeletedIds(prev => [...prev, serverId]);
    }
    setSuccess('');
  };

  const updateField = (tempId: string, field: keyof EditableTable, value: any) => {
    setTables(prev => prev.map(t =>
      t.tempId === tempId ? { ...t, [field]: value } : t
    ));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Deletes
      for (const id of deletedIds) {
        await deleteTable(id);
      }

      // Creates and Updates
      for (const t of tables) {
        if (!t.id) {
          await createTable({ name: t.name, seats: t.seats }); // assuming display order handled
        } else {
          // Check if changed
          const orig = originalTables.find(o => o.id === t.id);
          if (orig && (orig.name !== t.name || orig.seats !== t.seats || orig.is_active !== t.is_active)) {
            await updateTable(t.id, { name: t.name, seats: t.seats, is_active: t.is_active });
          }
        }
      }

      setDeletedIds([]);
      await loadTables();
      setSuccess('Modifications enregistrées');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

  const hasChanges = deletedIds.length > 0 || JSON.stringify(tables) !== JSON.stringify(originalTables);
  const isValid = tables.every(t => t.seats > 0 && t.name.trim());

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lk-text-base)', marginBottom: '4px' }}>Mes tables</h1>
          <p className="text-sm text-muted">Gérez la capacité de votre établissement.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px' }}>
          <div className="flex-col gap-3">
            {tables.map((table) => (
              <div key={table.tempId} className="table-row flex items-center gap-3">
                {/* Active Toggle */}
                <label className="settings-toggle">
                  <input 
                    type="checkbox" 
                    checked={table.is_active} 
                    onChange={e => updateField(table.tempId, 'is_active', e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>

                {/* Name */}
                <input
                  className="form-input"
                  style={{ flex: 1, height: '36px', fontSize: '13px', opacity: table.is_active ? 1 : 0.5 }}
                  value={table.name}
                  onChange={e => updateField(table.tempId, 'name', e.target.value)}
                  placeholder="Nom de la table"
                />

                {/* Seats stepper */}
                <div className="stepper" style={{ opacity: table.is_active ? 1 : 0.5 }}>
                  <button
                    className="stepper-btn"
                    onClick={() => updateField(table.tempId, 'seats', Math.max(1, table.seats - 1))}
                    disabled={table.seats <= 1}
                  >—</button>
                  <span className="stepper-value">{table.seats}</span>
                  <button
                    className="stepper-btn"
                    onClick={() => updateField(table.tempId, 'seats', table.seats + 1)}
                  >+</button>
                </div>

                <span className="text-xs text-muted" style={{ minWidth: '50px', opacity: table.is_active ? 1 : 0.5 }}>
                  {table.seats} couv.
                </span>

                {/* Delete */}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeTable(table.tempId, table.id)}
                  aria-label="Supprimer"
                  style={{ padding: '0 8px', color: 'var(--lk-error)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {tables.length === 0 && (
              <div className="text-center text-sm text-muted" style={{ padding: '20px 0' }}>
                Aucune table configurée.
              </div>
            )}
          </div>

          <button
            className="btn btn-secondary"
            style={{ marginTop: '16px', width: '100%' }}
            onClick={addTable}
          >
            <Plus size={14} /> Ajouter une table
          </button>
        </div>

        <div style={{
          padding: '16px 20px',
          background: 'var(--lk-bg-alt)',
          borderTop: '1px solid var(--lk-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomLeftRadius: 'var(--radius)',
          borderBottomRightRadius: 'var(--radius)',
        }}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: 'var(--lk-purple-light)' }} />
            <span className="text-sm font-semibold text-muted">
              Capacité : {totalCapacity} couverts
            </span>
          </div>
          
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasChanges || !isValid || saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </button>
        </div>
      </div>
      
      {error && <p className="form-error" style={{ marginTop: '16px' }}>{error}</p>}
      {success && <p className="text-sm" style={{ marginTop: '16px', color: 'var(--lk-success)' }}>{success}</p>}
      
    </div>
  );
}
