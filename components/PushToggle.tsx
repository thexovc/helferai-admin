'use client';
import React from 'react';
import { toast } from 'sonner';
import { inventoryClient } from '@/api/api-client';

type State = 'loading' | 'unsupported' | 'ios-install' | 'blocked' | 'off' | 'on';

const urlKey = (base64: string) => {
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
};

const pushSupported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

// Asks for permission if needed, then signs this device up for alerts
export async function enablePush(): Promise<'on' | 'blocked'> {
    if (Notification.permission !== 'granted' && (await Notification.requestPermission()) !== 'granted') return 'blocked';
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
        const { publicKey } = await inventoryClient.get<{ publicKey: string }>('/admin/auth/push/key');
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlKey(publicKey) });
    }
    await inventoryClient.post('/admin/auth/push/subscribe', sub.toJSON());
    return 'on';
}

const PROMPT_KEY = 'adminPushPromptHiddenAt';

// Alerts are on by default: where the browser already allows them this device
// is signed up quietly; otherwise a card asks once (browsers only allow the
// permission question after a tap). "Not now" hides it for a week.
export function PushPrompt({ accent }: { accent: string }) {
    const [show, setShow] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    React.useEffect(() => {
        if (!pushSupported() || !localStorage.getItem('inventoryToken')) return;
        if (Notification.permission === 'granted') { enablePush().catch(() => undefined); return; }
        if (Notification.permission !== 'default') return;
        let hiddenAt = 0;
        try { hiddenAt = Number(localStorage.getItem(PROMPT_KEY)) || 0; } catch { }
        if (Date.now() - hiddenAt > 7 * 86400000) setShow(true);
    }, []);
    if (!show) return null;
    const hide = () => { try { localStorage.setItem(PROMPT_KEY, String(Date.now())); } catch { } setShow(false); };
    const turnOn = async () => {
        setBusy(true);
        try {
            if ((await enablePush()) === 'on') toast.success('Alerts are on for this device');
        } catch (e: any) {
            toast.error(e?.message || 'Could not turn on alerts');
        } finally {
            setBusy(false);
            setShow(false);
        }
    };
    return (
        <div style={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom))', maxWidth: 400, marginLeft: 'auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.15)', padding: 16, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Turn on alerts</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Get new merchants, payments and other bell alerts on this device, even when the admin is closed.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={hide} disabled={busy} style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Not now</button>
                <button onClick={turnOn} disabled={busy} style={{ border: 'none', background: accent, color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>Turn on</button>
            </div>
        </div>
    );
}

// Phone/computer alerts for the bell: turns push on or off for this device
export default function PushToggle({ accent }: { accent: string }) {
    const [state, setState] = React.useState<State>('loading');
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const installed = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
        if (!pushSupported()) {
            // iPhones only allow alerts once the admin is added to the home screen
            setState(ios && !installed ? 'ios-install' : 'unsupported');
            return;
        }
        if (Notification.permission === 'denied') { setState('blocked'); return; }
        navigator.serviceWorker.ready
            .then(reg => reg.pushManager.getSubscription())
            .then(sub => setState(sub ? 'on' : 'off'))
            .catch(() => setState('unsupported'));
    }, []);

    const turnOn = async () => {
        setBusy(true);
        try {
            const r = await enablePush();
            setState(r === 'blocked' ? 'blocked' : 'on');
            if (r === 'on') toast.success('Alerts are on for this device');
        } catch (e: any) {
            toast.error(e?.message || 'Could not turn on alerts');
        } finally {
            setBusy(false);
        }
    };

    const turnOff = async () => {
        setBusy(true);
        try {
            const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
            if (sub) {
                await inventoryClient.post('/admin/auth/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => undefined);
                await sub.unsubscribe();
            }
            setState('off');
        } finally {
            setBusy(false);
        }
    };

    const test = async () => {
        setBusy(true);
        try {
            const r = await inventoryClient.post<{ sent: number }>('/admin/auth/push/test', {});
            if (r.sent) toast.success('Test alert sent'); else toast.error('No alert could be sent to this device');
        } catch (e: any) {
            toast.error(e?.message || 'Could not send a test alert');
        } finally {
            setBusy(false);
        }
    };

    if (state === 'loading' || state === 'unsupported') return null;
    const btn = (label: string, onClick: () => void, filled = false) => (
        <button disabled={busy} onClick={onClick} style={{ border: filled ? 'none' : '1px solid #e5e7eb', background: filled ? accent : '#fff', color: filled ? '#fff' : '#374151', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, whiteSpace: 'nowrap' }}>{label}</button>
    );
    const note = {
        'ios-install': 'To get alerts on iPhone, tap Share, then "Add to Home Screen", and open the admin from there.',
        blocked: 'Alerts are blocked for this site. Allow notifications in your browser settings to turn them on.',
        off: 'Get these alerts on this device, even when the admin is closed.',
        on: 'Alerts are on for this device.',
    }[state];
    return (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{note}</div>
            {state === 'off' && btn('Turn on', turnOn, true)}
            {state === 'on' && <>{btn('Test', test)}{btn('Turn off', turnOff)}</>}
        </div>
    );
}
