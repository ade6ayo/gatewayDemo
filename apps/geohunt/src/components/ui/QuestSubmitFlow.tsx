import { useRef, useState } from 'react';
import { Camera, Check, Loader2, RotateCcw } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../../store/useAuthStore';
import { useGPSStore } from '../../store/useGPSStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useQuestStore } from '../../store/useQuestStore';
import { supabase } from '../../lib/supabase';
import type { Quest } from '../../types';
import type { SubmissionWithMeta } from '../../store/useNotificationStore';

// iOS Safari: blob URLs are unreliable for displaying camera-captured images (especially HEIC),
// and <a download> is unsupported — the save-to-device trick silently does nothing.
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  quest: Quest;
}

function getSubmittedQuests(): string[] {
  try { return JSON.parse(localStorage.getItem('submitted_quests') || '[]') as string[]; }
  catch { return []; }
}

function compressImage(file: File, maxPx = 1200, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width >= height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], `geohunt-${Date.now()}.jpg`, { type: 'image/jpeg' })),
        'image/jpeg',
        quality,
      );
    };
    img.src = blobUrl;
  });
}

export default function QuestSubmitFlow({ quest }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);
  const { lat, lng } = useGPSStore(useShallow((s) => ({ lat: s.lat, lng: s.lng })));
  const { upsertSubmission, openDrawer } = useNotificationStore(
    useShallow((s) => ({ upsertSubmission: s.upsertSubmission, openDrawer: s.openDrawer })),
  );
  const selectQuest = useQuestStore((s) => s.selectQuest);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) { setError('Please capture an image.'); return; }
    if (nextFile.size > 10 * 1024 * 1024) { setError('Image must be smaller than 10MB.'); return; }
    setError('');

    if (isIOS) {
      // Use FileReader data URL for preview — blob URLs are unreliable on iOS Safari
      // for camera-captured images. Run compression in parallel; skip a.download.
      const [dataUrl, compressed] = await Promise.all([
        readFileAsDataURL(nextFile),
        compressImage(nextFile),
      ]);
      setFile(compressed);
      setPreviewUrl(dataUrl);
    } else {
      // Save the original (full-res) photo to device before compressing
      const origUrl = URL.createObjectURL(nextFile);
      const a = document.createElement('a');
      a.href = origUrl;
      a.download = `geohunt-${Date.now()}.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(origUrl), 5000);

      // Compress for upload — keeps storage lean while maintaining good quality
      const compressed = await compressImage(nextFile);
      const objectUrl = URL.createObjectURL(compressed);
      setFile(compressed);
      setPreviewUrl(objectUrl);
    }
  };

  const confirmUpload = async () => {
    if (!file || !user || lat === null || lng === null) return;
    setStatus('uploading');
    setError('');
    try {
      const path = `quest/${quest.id}/${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('submission-photos')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: row, error: insertError } = await supabase
        .from('submissions')
        .insert({
          submission_kind: 'quest',
          quest_id: quest.id,
          user_id: user.id,
          photo_url: path,
          gps_lat: lat,
          gps_lng: lng,
          status: 'pending',
        })
        .select('id, quest_id, submission_kind, user_id, photo_url, post_link, link_submitted_at, status, gps_lat, gps_lng, submitted_at, clue_id')
        .single();
      if (insertError) throw insertError;

      const submitted = Array.from(new Set([...getSubmittedQuests(), quest.id]));
      localStorage.setItem('submitted_quests', JSON.stringify(submitted));

      const meta: SubmissionWithMeta = {
        ...(row as SubmissionWithMeta),
        quest_title: quest.title,
        reward_airtime_naira: quest.reward_airtime_naira,
      };
      upsertSubmission(meta);
      // Close quest panel then open notification drawer in one batch so
      // AnimatePresence only ever deals with one panel at a time.
      selectQuest(null);
      openDrawer();
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Upload failed.');
    }
  };

  if (status === 'done') return null;

  return (
    <div className="submit-flow">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => void handlePhotoCapture(e)}
      />
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Submission preview" className="submission-preview" />
          <div className="submit-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setPreviewUrl('');
                setFile(null);
                if (cameraInputRef.current) cameraInputRef.current.value = '';
              }}
            >
              <RotateCcw size={17} />
              Retake
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => void confirmUpload()}
              disabled={status === 'uploading'}
            >
              {status === 'uploading'
                ? <Loader2 size={17} className="animate-spin" />
                : <Check size={17} />}
              {status === 'uploading' ? 'Uploading…' : 'Confirm'}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="primary-button submit-button"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera size={18} />
          Submit Quest
        </button>
      )}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
