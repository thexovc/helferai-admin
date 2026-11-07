// Pictures and videos inside admin broadcasts
const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'http://localhost:3000/api';
const BASE = '/admin/api/inventory/broadcasts';

export type BroadcastVideo = { url: string; playUrl?: string; poster?: string; name?: string; seconds?: number };

export const MAX_VIDEO_MB = 100;
export const MAX_IMAGE_MB = 10;

const auth = () => ({ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('inventoryToken') : ''}` });

export async function uploadBroadcastImage(file: File): Promise<string> {
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`Pictures can be up to ${MAX_IMAGE_MB} MB`);
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${API_BASE}${BASE}/images`, { method: 'POST', headers: auth(), body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.url) throw new Error(json.message || 'Could not upload the picture');
    return json.url;
}

// The video goes straight from the browser to Cloudinary (the server only signs
// the upload), so a big file never passes through our backend
export async function uploadBroadcastVideo(
    file: File,
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
): Promise<BroadcastVideo> {
    if (!file.type.startsWith('video/')) throw new Error('Choose a video file (MP4, MOV or WebM)');
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) throw new Error(`Videos can be up to ${MAX_VIDEO_MB} MB. Try a shorter clip.`);

    const signRes = await fetch(`${API_BASE}${BASE}/video-upload`, { method: 'POST', headers: auth() });
    const signed = await signRes.json().catch(() => ({}));
    if (!signRes.ok || !signed.signature) throw new Error(signed.message || 'Video upload is not available right now');

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', signed.apiKey);
    form.append('signature', signed.signature);
    Object.entries(signed.params || {}).forEach(([k, v]) => form.append(k, String(v)));

    const result: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', signed.uploadUrl);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => {
            let body: any = {};
            try { body = JSON.parse(xhr.responseText); } catch { }
            if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) resolve(body);
            else reject(new Error(body?.error?.message || 'The video could not be uploaded'));
        };
        xhr.onerror = () => reject(new Error('The upload stopped. Check your internet and try again.'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));
        signal?.addEventListener('abort', () => xhr.abort());
        xhr.send(form);
    });

    const url: string = result.secure_url;
    return {
        url,
        playUrl: url.replace('/video/upload/', '/video/upload/f_mp4,vc_h264,q_auto/').replace(/\.[a-z0-9]+$/i, '.mp4'),
        poster: url.replace('/video/upload/', '/video/upload/so_1,w_1200,c_limit/').replace(/\.[a-z0-9]+$/i, '.jpg'),
        name: file.name,
        seconds: typeof result.duration === 'number' ? Math.round(result.duration) : undefined,
    };
}
