import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminMap } from './AdminMap';
import { QuestEditPanel } from './QuestEditPanel';
import type { Quest } from '../../types';

export function QuestsTab() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null | 'new'>(null);
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);

  const selected = quests.find((q) => q.id === selectedId) ?? null;
  const mapLat = editingQuest === 'new' ? pinLat : (editingQuest?.lat ?? selected?.lat ?? null);
  const mapLng = editingQuest === 'new' ? pinLng : (editingQuest?.lng ?? selected?.lng ?? null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase
        .from('quests')
        .select('id, title, instructions, lat, lng, reward_airtime_naira, geofence_required, solved_by, solved_photo_url, solved_at, is_active, created_at, geofence_radius_m')
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setQuests((data || []) as Quest[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load quests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handlePinMove = (lat: number, lng: number) => {
    setPinLat(lat);
    setPinLng(lng);
    if (editingQuest && editingQuest !== 'new') {
      setEditingQuest({ ...editingQuest, lat, lng });
    }
  };

  const handleSave = async (data: Partial<Quest> & { lat: number; lng: number; title: string; instructions: string }) => {
    if (data.id) {
      const { error: updateError } = await supabase.from('quests').update({
        title: data.title,
        instructions: data.instructions,
        lat: data.lat,
        lng: data.lng,
        reward_airtime_naira: data.reward_airtime_naira,
        geofence_radius_m: data.geofence_radius_m ?? 50,
        geofence_required: data.geofence_required,
        is_active: data.is_active,
      }).eq('id', data.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from('quests').insert({
        title: data.title,
        instructions: data.instructions,
        lat: data.lat,
        lng: data.lng,
        reward_airtime_naira: data.reward_airtime_naira ?? 500,
        geofence_radius_m: data.geofence_radius_m ?? 50,
        geofence_required: data.geofence_required ?? true,
        is_active: data.is_active ?? true,
      });
      if (insertError) throw insertError;
    }
    void load();
  };

  const handleDelete = async (id: string) => {
    const { error: deleteError } = await supabase.from('quests').delete().eq('id', id);
    if (deleteError) throw deleteError;
    setSelectedId(null);
    void load();
  };

  const filtered = quests.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="quests-tab">
      <div className="quests-table-col">
        <div className="quests-toolbar">
          <input
            className="quests-search"
            placeholder="Search quests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="primary-button"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => {
              setEditingQuest('new');
              setSelectedId(null);
              setPinLat(null);
              setPinLng(null);
            }}
          >
            <Plus size={16} />
            New Quest
          </button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p className="quests-loading">Loading…</p> : null}

        <table className="quests-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Reward</th>
              <th>Fence</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr
                key={q.id}
                className={selectedId === q.id ? 'quest-row-selected' : ''}
                onClick={() => {
                  setSelectedId(q.id);
                  setEditingQuest(q);
                  setPinLat(q.lat);
                  setPinLng(q.lng);
                }}
              >
                <td>{q.title}</td>
                <td>
                  <span className={q.solved_by ? 'badge-solved' : 'badge-active'}>
                    {q.solved_by ? 'Solved' : 'Active'}
                  </span>
                </td>
                <td>₦{q.reward_airtime_naira}</td>
                <td>{q.geofence_required ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="quests-map-col">
        <AdminMap
          lat={mapLat}
          lng={mapLng}
          onPinMove={handlePinMove}
        />
        {editingQuest ? (
          <QuestEditPanel
            quest={editingQuest === 'new' ? null : editingQuest}
            defaultLat={pinLat}
            defaultLng={pinLng}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => { setEditingQuest(null); setPinLat(null); setPinLng(null); }}
          />
        ) : null}
      </div>
    </div>
  );
}
