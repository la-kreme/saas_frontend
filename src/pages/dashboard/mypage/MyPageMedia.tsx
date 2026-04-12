import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import type { BrunchPlaceDetail, BrunchPlaceUpdate } from '../../../lib/types';
import { uploadPlaceImage, uploadPlaceImages } from '../../../lib/backendApi';

interface Props {
  data: BrunchPlaceDetail;
  onSave: (updates: Partial<BrunchPlaceUpdate>) => Promise<void>;
  saving: boolean;
}

export default function MyPageMedia({ data, onSave, saving }: Props) {
  const [mainPhoto, setMainPhoto] = useState(data.main_photo_url || '');
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMainPhoto(data.main_photo_url || '');
    setPhotos(data.photos || []);
  }, [data]);

  const handleMainPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await uploadPlaceImage(file);
      setMainPhoto(url);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    setError('');
    try {
      const { urls } = await uploadPlaceImages(Array.from(files));
      setPhotos(prev => [...prev, ...urls]);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "Erreur lors de l'upload.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    setPhotos(prev => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const handleSave = async () => {
    await onSave({
      main_photo_url: mainPhoto || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-col gap-6">
      {/* Photo principale */}
      <div className="card flex-col gap-4">
        <h2 style={{ fontSize: '15px', fontWeight: 600 }}>
          📸 Photo principale
        </h2>
        <span className="text-xs text-muted">
          Idéalement une photo de plat. C'est l'image affichée dans les listes et en haut de votre page.
        </span>

        {mainPhoto ? (
          <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', maxWidth: '400px' }}>
            <img
              src={mainPhoto}
              alt="Photo principale"
              style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block', borderRadius: 'var(--radius)' }}
            />
            <button
              type="button"
              onClick={() => setMainPhoto('')}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} color="white" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => mainInputRef.current?.click()}
            style={{
              border: '2px dashed var(--lk-border)',
              borderRadius: 'var(--radius)',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast)',
              maxWidth: '400px',
            }}
          >
            <ImageIcon size={32} style={{ color: 'var(--lk-text-muted)', marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', color: 'var(--lk-text-muted)' }}>
              Cliquez pour ajouter une photo principale
            </p>
          </div>
        )}

        <input ref={mainInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleMainPhotoUpload} hidden />
        <button
          type="button"
          className="btn"
          style={{ alignSelf: 'flex-start', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-border)' }}
          disabled={uploading}
          onClick={() => mainInputRef.current?.click()}
        >
          {uploading
            ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Upload...</>
            : <><Upload size={14} /> {mainPhoto ? 'Remplacer' : 'Ajouter'}</>
          }
        </button>
      </div>

      {/* Galerie */}
      <div className="card flex-col gap-4">
        <h2 style={{ fontSize: '15px', fontWeight: 600 }}>
          🖼️ Galerie photos
        </h2>
        <span className="text-xs text-muted">
          6 à 8 photos recommandées : nourriture, salle, devanture, terrasse…
        </span>

        {photos.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {photos.map((url, i) => (
              <div key={`${url}-${i}`} style={{
                position: 'relative',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                aspectRatio: '4/3',
              }}>
                <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  display: 'flex', gap: '2px', padding: '4px',
                }}>
                  <button
                    type="button"
                    onClick={() => movePhoto(i, i - 1)}
                    disabled={i === 0}
                    style={{
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px',
                      width: '24px', height: '24px', cursor: i === 0 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: i === 0 ? 0.3 : 1,
                    }}
                    title="Déplacer vers la gauche"
                  >
                    <GripVertical size={12} color="white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    style={{
                      background: 'rgba(220,38,38,0.8)', border: 'none', borderRadius: '4px',
                      width: '24px', height: '24px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={12} color="white" />
                  </button>
                </div>
                <div style={{
                  position: 'absolute', bottom: '4px', left: '4px',
                  background: 'rgba(0,0,0,0.6)', color: 'white',
                  fontSize: '10px', fontWeight: 600,
                  padding: '2px 6px', borderRadius: '3px',
                }}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleGalleryUpload} hidden />
        <button
          type="button"
          className="btn"
          style={{ alignSelf: 'flex-start', background: 'var(--lk-surface-2)', border: '1px solid var(--lk-border)' }}
          disabled={uploadingGallery}
          onClick={() => galleryInputRef.current?.click()}
        >
          {uploadingGallery
            ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Upload...</>
            : <><Upload size={14} /> Ajouter des photos</>
          }
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* Save */}
      <button
        className="btn btn-primary"
        style={{ alignSelf: 'flex-start' }}
        disabled={saving}
        onClick={handleSave}
      >
        {saving ? <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Enregistrement...</>
          : saved ? <>&#x2705; Enregistré</>
          : <><Save size={14} /> Enregistrer les médias</>
        }
      </button>
    </div>
  );
}
