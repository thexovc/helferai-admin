'use client';
import React, { useRef, useState } from 'react';
import { Film, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { BroadcastVideo, MAX_VIDEO_MB, uploadBroadcastVideo } from '@/api/inventory/broadcastMedia';

const fmt = (s?: number) => (s == null ? '' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);

// The video player merchants see; the MP4 copy plays everywhere, the original is a fallback
export function BroadcastVideoPlayer({ video, maxWidth = 560 }: { video: BroadcastVideo; maxWidth?: number }) {
    return (
        <video controls playsInline preload="metadata" poster={video.poster}
            style={{ width: '100%', maxWidth, borderRadius: 12, background: '#000', display: 'block', margin: '0 auto' }}>
            {video.playUrl && <source src={video.playUrl} type="video/mp4" />}
            <source src={video.url} />
        </video>
    );
}

export default function BroadcastVideoPicker({
    value, onChange, onUploadingChange,
}: {
    value: BroadcastVideo | null;
    onChange: (v: BroadcastVideo | null) => void;
    onUploadingChange?: (busy: boolean) => void;
}) {
    const input = useRef<HTMLInputElement>(null);
    const abort = useRef<AbortController | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [fileName, setFileName] = useState('');

    const pick = async (file?: File) => {
        if (!file) return;
        abort.current = new AbortController();
        setFileName(file.name);
        setProgress(0);
        onUploadingChange?.(true);
        try {
            const v = await uploadBroadcastVideo(file, setProgress, abort.current.signal);
            onChange(v);
            toast.success('Video added');
        } catch (err: any) {
            if (err?.message !== 'Upload cancelled') toast.error(err?.message || 'The video could not be uploaded');
        } finally {
            setProgress(null);
            onUploadingChange?.(false);
            abort.current = null;
            if (input.current) input.current.value = '';
        }
    };

    const box: React.CSSProperties = { border: '1.5px dashed #d1d5db', borderRadius: 10, padding: 14, background: '#f9fafb' };

    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                <span>Video (optional)</span>
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>MP4, MOV or WebM, up to {MAX_VIDEO_MB} MB</span>
            </label>
            <input ref={input} type="file" accept="video/mp4,video/quicktime,video/webm,video/*" style={{ display: 'none' }} onChange={e => pick(e.target.files?.[0])} />

            {progress !== null ? (
                <div style={box}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                        <Loader2 size={16} className="animate-spin" color="#6c9e4e" />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Uploading {fileName}… {progress}%</span>
                        <button type="button" onClick={() => abort.current?.abort()} title="Cancel upload"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280', display: 'flex' }}><X size={16} /></button>
                    </div>
                    <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: '#6c9e4e', transition: 'width .2s' }} />
                    </div>
                </div>
            ) : value ? (
                <div style={{ ...box, borderStyle: 'solid', background: '#fff' }}>
                    <BroadcastVideoPlayer video={value} maxWidth={420} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: '#6b7280' }}>
                        <Film size={14} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {value.name || 'Video'}{value.seconds != null ? ` · ${fmt(value.seconds)}` : ''}
                        </span>
                        <button type="button" onClick={() => input.current?.click()}
                            style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Change</button>
                        <button type="button" onClick={() => onChange(null)}
                            style={{ border: 'none', background: '#fee2e2', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Trash2 size={13} /> Remove
                        </button>
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 11, color: '#6b7280' }}>
                        Merchants can play it inside the app. In the email it shows as a picture with a Play button.
                    </p>
                </div>
            ) : (
                <button type="button" onClick={() => input.current?.click()}
                    style={{ ...box, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6c9e4e' }}>
                    <Film size={16} /> Add a video
                </button>
            )}
        </div>
    );
}
