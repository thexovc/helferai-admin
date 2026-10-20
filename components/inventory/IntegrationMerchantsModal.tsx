'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Modal from '../Modal';
import MerchantLogo from './MerchantLogo';
import { inventoryClient } from '@/api/api-client';

type Merchant = {
    businessId: string; name: string; email: string; logo?: string | null;
    status: string; connectedAt?: string | null; lastUsed?: string | null;
    chats: number; numbers: number; error?: string | null;
};

const ago = (v?: string | null) => {
    if (!v) return null;
    const mins = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
    if (mins < 60) return `${Math.max(mins, 1)} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    return months < 12 ? `${months} month${months === 1 ? '' : 's'} ago` : `${Math.floor(months / 12)} yr ago`;
};
const when = (v?: string | null) => (v ? new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, [string, string]> = { active: ['#eaf4e3', '#3f7d2c'], inactive: ['#f3f4f6', '#6b7280'], 'not set up': ['#fff7ed', '#c2410c'] };
    const [bg, color] = map[s] || ['#fef2f2', '#dc2626'];
    return { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: bg, color, textTransform: 'capitalize', whiteSpace: 'nowrap' };
};

const th: React.CSSProperties = { padding: '9px 10px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap', position: 'sticky', top: 0 };
const td: React.CSSProperties = { padding: '10px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };

// Business Integrations > View: who is connected and when they last used it
export default function IntegrationMerchantsModal({ integrationId, onClose }: { integrationId: string; onClose: () => void }) {
    const [search, setSearch] = React.useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'integrations', integrationId, 'merchants'],
        queryFn: () => inventoryClient.get<{ integration: { name: string; slug: string }; summary: any; merchants: Merchant[] }>(`/admin/api/inventory/integrations/${integrationId}/merchants`),
    });
    const isWhatsApp = data?.integration.slug === 'whatsapp';
    const q = search.trim().toLowerCase();
    const rows = (data?.merchants || []).filter(m => !q || m.name.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q));

    return (
        <Modal isOpen onClose={onClose} title={`${data?.integration.name || 'Integration'} · connected merchants`} maxWidth={860}
            footer={<button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>}>
            {isLoading || !data ? <div style={{ color: '#9ca3af', fontSize: 13, padding: 20 }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                        {[
                            ['Connected', data.summary.connected, '#3f7d2c'],
                            ['Switched off', data.summary.inactive, '#6b7280'],
                            ['Used in last 7 days', data.summary.usedLast7Days, '#0284c7'],
                            ['Never used', data.summary.neverUsed, '#c2410c'],
                        ].map(([label, value, color]) => (
                            <div key={label as string} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: '10px 12px' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: color as string }}>{value as number}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{label as string}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ position: 'relative', maxWidth: 300 }}>
                        <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 11 }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchant"
                            style={{ height: 36, width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px 0 30px', fontSize: 13, outline: 'none' }} />
                    </div>
                    <div style={{ maxHeight: '50vh', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 10 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                            <thead><tr>
                                {['Merchant', 'Status', 'Last used', ...(isWhatsApp ? ['Chats', 'Numbers'] : []), 'Connected'].map(h => <th key={h} style={th}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {rows.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 24 }}>No merchants found</td></tr>}
                                {rows.map(m => (
                                    <tr key={m.businessId}>
                                        <td style={td}>
                                            <Link href={`/inventory/businesses/${m.businessId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                                <MerchantLogo name={m.name} logo={m.logo} size={28} radius={7} />
                                                <span><b style={{ color: '#1a1a2e' }}>{m.name}</b><div style={{ fontSize: 11, color: '#9ca3af' }}>{m.email}</div></span>
                                            </Link>
                                        </td>
                                        <td style={td}><span style={statusStyle(m.status)}>{m.status}</span>{m.error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{m.error}</div>}</td>
                                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                                            {m.lastUsed ? <><b>{ago(m.lastUsed)}</b><div style={{ fontSize: 11, color: '#9ca3af' }}>{when(m.lastUsed)}</div></> : <span style={{ color: '#9ca3af' }}>Never</span>}
                                        </td>
                                        {isWhatsApp && <td style={td}>{m.chats.toLocaleString()}</td>}
                                        {isWhatsApp && <td style={td}>{m.numbers.toLocaleString()}</td>}
                                        <td style={{ ...td, whiteSpace: 'nowrap' }}>{m.connectedAt ? new Date(m.connectedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {isWhatsApp && (
                        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                            Last used is the latest message the WhatsApp assistant received for that merchant. Chats is how many different phone numbers have messaged it; Numbers is how many WhatsApp numbers the merchant has registered.
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
