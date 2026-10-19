import { useRef, useState } from 'react';
import { Camera, Check, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGPSStore } from '../../store/useGPSStore';
import { supabase } from '../../lib/supabase';
import type { Clue } from '../../types';

interface Props {
  clue: Clue;
}

function getSubmittedClues() {
  try {
    return JSON.parse(localStorage.getItem('submitted_clues') || '[]') as string[];
  } catch {
    return [];
  }
}

// iOS Safari has three known issues with the Android-style approach:
// 1. blob URLs can fail to render for camera-captured images (especially HEIC)
// 2. iPhone cameras often produce HEIC/HEIF which Supabase rejects
// 3. <a download> is unsupported — the save-to-device trick silently does nothing
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Normalises any image (including HEIC) to a JPEG blob via canvas so that
// Supabase receives a consistent format regardless of iPhone camera output.
function normaliseToJpeg(file: File): Promise<File> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(new File([blob], `geohunt-${Date.now()}.jpg`, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

export default function SubmitFlow({ clue }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);
  const { lat, lng } = useGPSStore((state) => ({ lat: state.lat, lng: state.lng }));
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const alreadySubmitted = getSubmittedClues().includes(clue.id) || status === 'success';

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setError('Please capture an image.');
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB.');
      return;
    }

    if (isIOS) {
      // Use FileReader (data URL) for preview — more reliable than blob URLs on iOS Safari.
      // Run JPEG normalisation in parallel so HEIC files upload cleanly.
      const [dataUrl, jpegFile] = await Promise.all([
        readFileAsDataURL(nextFile),
        normaliseToJpeg(nextFile),
      ]);
      setFile(jpegFile);
      setPreviewUrl(dataUrl);
      setError('');
      // Intentionally skip a.download — it has no effect on iOS Safari.
    } else {
      // Android path — unchanged.
      const objectUrl = URL.createObjectURL(nextFile);
      setFile(nextFile);
      setPreviewUrl(objectUrl);
      setError('');

      // Save photo to device so user can repost it on social media
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `geohunt-${Date.now()}.jpg`;
      a.click();
    }
  };

  const confirmUpload = async () => {
    if (!file || !user || lat === null || lng === null) return;
    setStatus('uploading');
    setError('');
    try {
      const path = `${clue.id}/${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('submission-photos')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('submissions').insert({
        clue_id: clue.id,
        user_id: user.id,
        photo_url: path,
        gps_lat: lat,
        gps_lng: lng,
      });
      if (insertError) throw insertError;

      const submitted = Array.from(new Set([...getSubmittedClues(), clue.id]));
      localStorage.setItem('submitted_clues', JSON.stringify(submitted));
      setStatus('success');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Upload failed.');
    }
  };

  const handleRetake = () => {
    setPreviewUrl('');
    setFile(null);
    // Reset the input value so iOS allows the camera to open again on the next tap.
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (alreadySubmitted) {
    return <p className="submit-success">Submitted! Our team will review your answer.</p>;
  }

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
            <button type="button" className="secondary-button" onClick={handleRetake}>
              <RotateCcw size={17} />
              Retake
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => void confirmUpload()}
              disabled={status === 'uploading'}
            >
              <Check size={17} />
              {status === 'uploading' ? 'Uploading' : 'Confirm'}
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
