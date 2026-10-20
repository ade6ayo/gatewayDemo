import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const [finalInstructions, setFinalInstructions] = useState('');
  const [postTemplate, setPostTemplate] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('app_settings').select('key, value');
      for (const row of data || []) {
        if (row.key === 'final_instructions') setFinalInstructions(row.value as string);
        if (row.key === 'post_template') setPostTemplate(row.value as string);
      }
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    setError('');
    setSuccess(false);
    try {
      const { error: upsertError } = await supabase.from('app_settings').upsert([
        { key: 'final_instructions', value: finalInstructions, updated_at: new Date().toISOString() },
        { key: 'post_template', value: postTemplate, updated_at: new Date().toISOString() },
      ]);
      if (upsertError) throw upsertError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header" style={{ marginBottom: 18 }}>
          <h3>App Settings</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-form">
          <label htmlFor="final-instructions">Final Instructions (shown after photo upload)</label>
          <textarea
            id="final-instructions"
            className="quest-textarea"
            rows={4}
            value={finalInstructions}
            onChange={(e) => setFinalInstructions(e.target.value)}
          />
          <label htmlFor="post-template">Post Template (players copy this text)</label>
          <textarea
            id="post-template"
            className="quest-textarea"
            rows={3}
            value={postTemplate}
            onChange={(e) => setPostTemplate(e.target.value)}
          />
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p style={{ color: 'oklch(0.44 0.13 145)', fontWeight: 800 }}>Saved!</p> : null}
          <button type="button" className="primary-button" onClick={() => void save()} disabled={busy}>
            {busy ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
