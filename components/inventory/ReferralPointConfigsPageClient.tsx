'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Settings, Edit2, Trash2, Info } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import { inventoryClient } from '@/api/api-client';

type Rule = {
    type: string; group: string; label: string; points: string; referrer?: string;
    id: string | null; userPoints: number; referrerPoints: number; active: boolean; updatedAt?: string | null;
};
type Unused = { id: string; name: string; userPoints: number; description?: string | null };

const BASE = '/admin/api/inventory/referrals/points/rules';
const GROUPS = ['Referrals', 'Subscriptions', 'Everyday activity', "Referrer's share", 'Milestones'];

const inputStyle: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };

// Only the rules the app actually reads are listed; the points and on/off
// switch can be changed, and changes count straight away
export default function ReferralPointConfigsPageClient() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'referrals', 'point-rules'],
        queryFn: () => inventoryClient.get<{ rules: Rule[]; unused: Unused[] }>(BASE),
    });
    const [editing, setEditing] = useState<Rule | null>(null);
    const [userPoints, setUserPoints] = useState('');
    const [referrerPoints, setReferrerPoints] = useState('');
    const [saving, setSaving] = useState(false);
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['inventory', 'referrals', 'point-rules'] });

    const openEdit = (r: Rule) => { setEditing(r); setUserPoints(String(r.userPoints)); setReferrerPoints(String(r.referrerPoints)); };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            await inventoryClient.put(`${BASE}/${editing.type}`, { userPoints: Number(userPoints) || 0, referrerPoints: Number(referrerPoints) || 0 });
            toast.success('Points updated. The app uses the new value straight away.');
            refresh();
            setEditing(null);
        } catch (err: any) {
            toast.error(err?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (r: Rule) => {
        try {
            await inventoryClient.put(`${BASE}/${r.type}`, { active: !r.active });
            toast.success(`${r.label}: ${r.active ? 'switched off' : 'switched on'}`);
            refresh();
        } catch (err: any) {
            toast.error(err?.message || 'Could not change it');
        }
    };

    const removeUnused = async (u: Unused) => {
        if (!confirm(`Remove "${u.name}"? The app never reads it, so no one gets points from it now.`)) return;
        try {
            await inventoryClient.delete(`${BASE}/unused/${u.id}`);
            toast.success(`"${u.name}" removed`);
            refresh();
        } catch (err: any) {
            toast.error(err?.message || 'Could not remove it');
        }
    };

    const rules = data?.rules || [];
    return (
        <div>
            <Topbar title="Reward Point Configs" subtitle="How many points each action earns in the HelferAI app." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={24} /></div>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Point rules</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{rules.length} rules used by the app. Change the points or switch a rule off; it applies straight away.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 13, color: '#075985', lineHeight: 1.5 }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>Need points for something new, like adding a customer? That needs a small change in the app to say when the points are given. Once it&apos;s added, the new rule shows up here automatically.</span>
                </div>

                {isLoading ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading...</div> : GROUPS.map(group => {
                    const list = rules.filter(r => r.group === group);
                    if (!list.length) return null;
                    return (
                        <div key={group} style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: '#1a1a2e', borderBottom: '1px solid #f0f0f0' }}>{group}</div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                                    <thead><tr>{['When', 'Points', 'Who gets them', 'On', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {list.map(r => (
                                            <tr key={r.type} style={{ opacity: r.active ? 1 : 0.55 }}>
                                                <td style={td}><b style={{ color: '#1a1a2e' }}>{r.label}</b><div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{r.type}</div></td>
                                                <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 700 }}>
                                                    {r.userPoints.toLocaleString()}
                                                    {r.referrer && <span style={{ fontWeight: 400, color: '#6b7280' }}> · {r.referrerPoints.toLocaleString()}</span>}
                                                </td>
                                                <td style={td}>{r.points}{r.referrer && <span style={{ color: '#6b7280' }}> · {r.referrer}</span>}</td>
                                                <td style={td}>
                                                    <button onClick={() => toggle(r)} title={r.active ? 'Switch off' : 'Switch on'}
                                                        style={{ width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', background: r.active ? '#6c9e4e' : '#d1d5db' }}>
                                                        <span style={{ position: 'absolute', top: 3, left: r.active ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                                                    </button>
                                                </td>
                                                <td style={td}>
                                                    <button onClick={() => openEdit(r)} title="Change points"
                                                        style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Edit2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}

                {(data?.unused || []).length > 0 && (
                    <div style={{ background: '#fffbeb', borderRadius: 14, border: '1px solid #fde68a', padding: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>Saved rules the app doesn&apos;t use</div>
                        <div style={{ fontSize: 12, color: '#92400e', margin: '4px 0 10px' }}>These were added here before, but the app never reads them, so no one earns these points.</div>
                        {(data?.unused || []).map(u => (
                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #fde68a', fontSize: 13 }}>
                                <span><b>{u.name}</b> · {u.userPoints} points</span>
                                <button onClick={() => removeUnused(u)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                                    <Trash2 size={13} /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editing && (
                <Modal isOpen onClose={() => setEditing(null)} title="Change points"
                    footer={<>
                        <button onClick={() => setEditing(null)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={save} disabled={saving} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                    </>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{editing.label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: editing.referrer ? '1fr 1fr' : '1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Points for {editing.points.toLowerCase()}</label>
                                <input inputMode="numeric" value={userPoints} onChange={e => setUserPoints(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
                            </div>
                            {editing.referrer && (
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Points for {editing.referrer.toLowerCase()}</label>
                                    <input inputMode="numeric" value={referrerPoints} onChange={e => setReferrerPoints(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Points already given out stay as they are; the new value applies from now on.</div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
