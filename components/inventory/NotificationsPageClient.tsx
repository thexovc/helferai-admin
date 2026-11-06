'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Plus, Edit2, Trash2, Pause, Play, X } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import { inventoryClient } from '@/api/api-client';

const BASE = '/admin/api/inventory/in-app-notifications';
type Kind = 'popup' | 'banner';
type Note = {
    id: string; kind: Kind; title: string | null; message: string; buttonText: string | null; linkUrl: string | null;
    startsAt: string; endsAt: string; audience: 'owners' | 'staff' | 'both'; frequency: 'until_interaction' | 'every_login';
    isActive: boolean; status: 'Live' | 'Scheduled' | 'Ended' | 'Paused'; interactions: number;
};

const AUDIENCE: Record<string, string> = { owners: 'Main account owners', staff: 'Staff users', both: 'Owners and staff' };
const FREQUENCY: Record<string, string> = { until_interaction: 'Until they close or tap it', every_login: 'Every sign-in' };
const STATUS: Record<string, { bg: string; color: string }> = {
    Live: { bg: '#dcfce7', color: '#15803d' }, Scheduled: { bg: '#e0f2fe', color: '#0369a1' },
    Ended: { bg: '#f3f4f6', color: '#6b7280' }, Paused: { bg: '#fef3c7', color: '#b45309' },
};
const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };
const input: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' };
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

// datetime-local wants local "YYYY-MM-DDTHH:mm"
const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const fmt = (d: string) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const blank = () => ({
    kind: 'popup' as Kind, title: '', message: '', buttonText: '', linkUrl: '',
    startsAt: toLocal(new Date()), endsAt: toLocal(new Date(Date.now() + 7 * 86400000)),
    audience: 'both', frequency: 'until_interaction',
});

function Choice({ value, options, onChange }: { value: string; options: [string, string, string?][]; onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8 }}>
            {options.map(([v, l, hint]) => (
                <button key={v} type="button" onClick={() => onChange(v)} style={{
                    padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${value === v ? '#6c9e4e' : '#e5e7eb'}`, background: value === v ? '#eaf4e3' : '#fff', color: value === v ? '#3f7d2c' : '#374151',
                }}>
                    {l}{hint && <div style={{ fontSize: 11, fontWeight: 400, color: '#6b7280', marginTop: 2 }}>{hint}</div>}
                </button>
            ))}
        </div>
    );
}

// In-app messages for the HelferAI app: a pop-up after sign-in, or a one-line
// banner at the top of the app (several banners rotate like a carousel)
export default function NotificationsPageClient() {
    const queryClient = useQueryClient();
    const [kind, setKind] = useState<'' | Kind>('');
    const [editing, setEditing] = useState<Note | null>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(blank());
    const [saving, setSaving] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'in-app-notifications', kind],
        queryFn: () => inventoryClient.get<{ notifications: Note[] }>(`${BASE}${kind ? `?kind=${kind}` : ''}`),
    });
    const notes = data?.notifications || [];
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['inventory', 'in-app-notifications'] });
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => { setEditing(null); setForm(blank()); setOpen(true); };
    const openEdit = (n: Note) => {
        setEditing(n);
        setForm({ kind: n.kind, title: n.title || '', message: n.message, buttonText: n.buttonText || '', linkUrl: n.linkUrl || '', startsAt: toLocal(new Date(n.startsAt)), endsAt: toLocal(new Date(n.endsAt)), audience: n.audience, frequency: n.frequency });
        setOpen(true);
    };

    const save = async () => {
        if (!form.message.trim()) return toast.error('Write the message');
        if (new Date(form.endsAt) <= new Date(form.startsAt)) return toast.error('The end date must be after the start date');
        setSaving(true);
        const dto = { ...form, title: form.kind === 'popup' ? form.title : null, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() };
        try {
            if (editing) await inventoryClient.put(`${BASE}/${editing.id}`, dto);
            else await inventoryClient.post(BASE, dto);
            toast.success(editing ? 'Notification updated' : 'Notification created');
            setOpen(false);
            refresh();
        } catch (err: any) {
            toast.error(err?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };

    const togglePause = async (n: Note) => {
        try {
            await inventoryClient.put(`${BASE}/${n.id}`, { isActive: !n.isActive });
            toast.success(n.isActive ? 'Paused. It no longer shows in the app.' : 'Resumed');
            refresh();
        } catch (err: any) { toast.error(err?.message || 'Could not change it'); }
    };

    const remove = async (n: Note) => {
        if (!confirm('Delete this notification? It stops showing in the app straight away.')) return;
        try {
            await inventoryClient.delete(`${BASE}/${n.id}`);
            toast.success('Notification deleted');
            refresh();
        } catch (err: any) { toast.error(err?.message || 'Could not delete it'); }
    };

    const tab = (v: '' | Kind, l: string) => (
        <button onClick={() => setKind(v)} style={{ padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: kind === v ? '#6c9e4e' : 'transparent', color: kind === v ? '#fff' : '#6b7280' }}>{l}</button>
    );

    return (
        <div>
            <Topbar title="Notifications" subtitle="Pop-ups and top banners shown inside the HelferAI app." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={24} /></div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>In-app notifications</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{notes.filter(n => n.status === 'Live').length} showing in the app now</p>
                        </div>
                    </div>
                    <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <Plus size={15} /> New notification
                    </button>
                </div>

                <div style={{ display: 'inline-flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
                    {tab('', 'All')}{tab('popup', 'Pop-ups')}{tab('banner', 'Top banners')}
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                        <thead><tr>{['Type', 'Message', 'Shows', 'Who sees it', 'How often', 'Status', 'Closed or tapped', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan={8} style={{ ...td, color: '#9ca3af' }}>Loading...</td></tr>
                                : notes.length === 0 ? <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: 40, color: '#9ca3af' }}>No notifications yet. Create one to show a pop-up or top banner in the app.</td></tr>
                                    : notes.map(n => (
                                        <tr key={n.id}>
                                            <td style={td}><span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: n.kind === 'popup' ? '#eef2ff' : '#f0f7eb', color: n.kind === 'popup' ? '#4338ca' : '#3f7d2c' }}>{n.kind === 'popup' ? 'Pop-up' : 'Top banner'}</span></td>
                                            <td style={{ ...td, maxWidth: 320 }}>
                                                {n.title && <b style={{ color: '#1a1a2e' }}>{n.title}<br /></b>}
                                                <span style={{ color: '#6b7280' }}>{n.message.length > 110 ? n.message.slice(0, 110) + '…' : n.message}</span>
                                            </td>
                                            <td style={{ ...td, fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(n.startsAt)}<br /><span style={{ color: '#9ca3af' }}>to {fmt(n.endsAt)}</span></td>
                                            <td style={td}>{AUDIENCE[n.audience]}</td>
                                            <td style={td}>{FREQUENCY[n.frequency]}</td>
                                            <td style={td}><span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, ...STATUS[n.status] }}>{n.status}</span></td>
                                            <td style={{ ...td, fontWeight: 700 }}>{n.interactions.toLocaleString()}</td>
                                            <td style={td}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button title="Edit" onClick={() => openEdit(n)} style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Edit2 size={14} /></button>
                                                    <button title={n.isActive ? 'Pause' : 'Resume'} onClick={() => togglePause(n)} style={{ background: '#fef3c7', border: 'none', color: '#b45309', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}>{n.isActive ? <Pause size={14} /> : <Play size={14} />}</button>
                                                    <button title="Delete" onClick={() => remove(n)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {open && (
                <Modal isOpen onClose={() => setOpen(false)} title={editing ? 'Edit notification' : 'New notification'}
                    footer={<>
                        <button onClick={() => setOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={save} disabled={saving} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create'}</button>
                    </>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <span style={label}>Type</span>
                            <Choice value={form.kind} onChange={v => set('kind', v)} options={[['popup', 'Pop-up', 'Opens after the user signs in'], ['banner', 'Top banner', 'One line at the top; several rotate']]} />
                        </div>
                        {form.kind === 'popup' && (
                            <div>
                                <span style={label}>Title</span>
                                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. New: sell on WhatsApp" style={input} maxLength={255} />
                            </div>
                        )}
                        <div>
                            <span style={label}>Message</span>
                            {form.kind === 'banner'
                                ? <input value={form.message} onChange={e => set('message', e.target.value)} placeholder="One short line, e.g. 20% off yearly plans this week" style={input} maxLength={140} />
                                : <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="What should merchants know?" style={{ ...input, height: 90, padding: '10px 12px', resize: 'none', fontFamily: 'inherit' }} />}
                            {form.kind === 'banner' && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{form.message.length}/140</div>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><span style={label}>Button text (optional)</span><input value={form.buttonText} onChange={e => set('buttonText', e.target.value)} placeholder="e.g. Upgrade now" style={input} maxLength={100} /></div>
                            <div><span style={label}>Button link (optional)</span><input value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)} placeholder="https://..." style={input} maxLength={500} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><span style={label}>Show from</span><input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} style={input} /></div>
                            <div><span style={label}>Show until</span><input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} style={input} /></div>
                        </div>
                        <div>
                            <span style={label}>Who sees it</span>
                            <Choice value={form.audience} onChange={v => set('audience', v)} options={[['owners', 'Main account owners'], ['staff', 'Staff users'], ['both', 'Both']]} />
                        </div>
                        <div>
                            <span style={label}>How often</span>
                            <Choice value={form.frequency} onChange={v => set('frequency', v)} options={[['until_interaction', 'Until first interaction', 'Stops once they close or tap it'], ['every_login', 'Every sign-in', 'Shows each time until the end date']]} />
                        </div>

                        {/* Preview */}
                        <div>
                            <span style={label}>Preview</span>
                            {form.kind === 'banner' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: '#1a1a2e', color: '#fff', fontSize: 13 }}>
                                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.message || 'Your one-line message'}</span>
                                    {form.buttonText.trim() && <span style={{ fontWeight: 700, color: '#a7d38a' }}>{form.buttonText} ›</span>}
                                    <X size={14} style={{ opacity: 0.7 }} />
                                </div>
                            ) : (
                                <div style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 28px', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', maxWidth: 340, margin: '0 auto', textAlign: 'center' }}>
                                    <X size={16} style={{ position: 'absolute', top: 10, right: 10, color: '#9ca3af' }} />
                                    <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>{form.title || 'Title'}</div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, whiteSpace: 'pre-wrap' }}>{form.message || 'Your message'}</div>
                                    {form.buttonText.trim() && <div style={{ marginTop: 14, padding: '9px 0', borderRadius: 8, background: '#6c9e4e', color: '#fff', fontWeight: 700, fontSize: 13 }}>{form.buttonText}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
