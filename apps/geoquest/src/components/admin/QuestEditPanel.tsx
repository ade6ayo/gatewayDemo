import { type FormEvent, useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Quest } from '../../types';

interface Props {
  quest: Quest | null;
  defaultLat: number | null;
  defaultLng: number | null;
  onSave: (data: Partial<Quest> & { lat: number; lng: number; title: string; instructions: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function QuestEditPanel({ quest, defaultLat, defaultLng, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [reward, setReward] = useState('500');
  const [geofenceRadiusM, setGeofenceRadiusM] = useState('50');
  const [geofenceRequired, setGeofenceRequired] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setInstructions(quest.instructions);
      setLat(String(quest.lat));
      setLng(String(quest.lng));
      setReward(String(quest.reward_airtime_naira));
      setGeofenceRadiusM(String(quest.geofence_radius_m ?? 50));
      setGeofenceRequired(quest.geofence_required);
      setIsActive(true);
    } else {
      setTitle('');
      setInstructions('');
      setLat(defaultLat !== null ? String(defaultLat.toFixed(6)) : '');
      setLng(defaultLng !== null ? String(defaultLng.toFixed(6)) : '');
      setReward('500');
      setGeofenceRadiusM('50');
      setGeofenceRequired(true);
      setIsActive(true);
    }
    setError('');
    setConfirmDelete(false);
  }, [quest, defaultLat, defaultLng]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) { setError('Enter valid lat/lng values.'); return; }
    setBusy(true);
    setError('');
    try {
      await onSave({
        id: quest?.id,
        title,
        instructions,
        lat: parsedLat,
        lng: parsedLng,
        reward_airtime_naira: parseInt(reward, 10) || 500,
        geofence_radius_m: parseInt(geofenceRadiusM, 10) || 50,
        geofence_required: geofenceRequired,
        is_active: isActive,
      });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!quest) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy(true);
    try {
      await onDelete(quest.id);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Delete failed.');
      setBusy(false);
    }
  };

  return (
    <div className="quest-edit-panel">
      <div className="drawer-header" style={{ marginBottom: 16 }}>
        <h3>{quest ? 'Edit Quest' : 'New Quest'}</h3>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <form className="drawer-form" onSubmit={handleSubmit}>
        <label htmlFor="q-title">Title</label>
        <input id="q-title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label htmlFor="q-instructions">Instructions</label>
        <textarea
          id="q-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="quest-textarea"
          rows={4}
          required
        />

        <div className="latLng-row">
          <div>
            <label htmlFor="q-lat">Latitude</label>
            <input id="q-lat" value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" required />
          </div>
          <div>
            <label htmlFor="q-lng">Longitude</label>
            <input id="q-lng" value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" required />
          </div>
        </div>

        <label htmlFor="q-reward">Reward (₦ airtime)</label>
        <input
          id="q-reward"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          inputMode="numeric"
          required
        />

        <div className="toggle-row">
          <label htmlFor="q-geofence">Require player to be nearby</label>
          <input
            id="q-geofence"
            type="checkbox"
            checked={geofenceRequired}
            onChange={(e) => setGeofenceRequired(e.target.checked)}
          />
        </div>

        {geofenceRequired ? (
          <>
            <label htmlFor="q-radius">Required proximity (metres)</label>
            <input
              id="q-radius"
              value={geofenceRadiusM}
              onChange={(e) => setGeofenceRadiusM(e.target.value)}
              inputMode="numeric"
              placeholder="50"
            />
          </>
        ) : null}

        <div className="toggle-row">
          <label htmlFor="q-active">Active</label>
          <input
            id="q-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? 'Saving…' : quest ? 'Save Changes' : 'Create Quest'}
        </button>
      </form>

      {quest ? (
        <button
          type="button"
          className="delete-button"
          onClick={() => void handleDelete()}
          disabled={busy}
        >
          <Trash2 size={16} />
          {confirmDelete ? 'Confirm Delete' : 'Delete Quest'}
        </button>
      ) : null}
    </div>
  );
}
