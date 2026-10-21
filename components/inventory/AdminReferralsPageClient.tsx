'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Gift, Info } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import { inventoryClient } from '@/api/api-client';

const BASE = '/admin/api/inventory/admin-referrals';
const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };
const formatCurrency = (n: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

// Merchants each admin referred with their code, and the bonuses earned from them
export default function AdminReferralsPageClient() {
    const queryClient = useQueryClient();
    const [openAdmin, setOpenAdmin] = useState<any | null>(null);
    const { data, isLoading } = useQuery({ queryKey: ['inventory', 'admin-referrals'], queryFn: () => inventoryClient.get<any>(BASE) });
    const { data: detail, isLoading: loadingDetail } = useQuery({
        queryKey: ['inventory', 'admin-referrals', openAdmin?.id],
        queryFn: () => inventoryClient.get<any>(`${BASE}/${openAdmin.id}`),
        enabled: !!openAdmin,
    });
    const rows: any[] = data?.admins || [];
    const bonus = data?.bonusAmount || 1000;
    const totals = rows.reduce((t, r) => ({ referrals: t.referrals + r.referrals, earned: t.earned + r.earned, unpaid: t.unpaid + r.unpaid }), { referrals: 0, earned: 0, unpaid: 0 });

    const togglePaid = async (m: any, b: any) => {
        try {
            await inventoryClient.put(`${BASE}/${openAdmin.id}/merchants/${m.businessId}/bonuses/${b.key}`, { paid: !b.paid });
            toast.success(b.paid ? 'Marked as not paid' : `Marked ${formatCurrency(b.amount)} as paid`);
            queryClient.invalidateQueries({ queryKey: ['inventory', 'admin-referrals'] });
        } catch (err: any) {
            toast.error(err?.message || 'Could not update the bonus');
        }
    };

    return (
        <div>
            <Topbar title="Admin Referrals" subtitle="Merchants each admin referred, and the bonuses they earned." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gift size={24} /></div>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Referral bonuses</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{totals.referrals} referred merchants · {formatCurrency(totals.earned)} earned · {formatCurrency(totals.unpaid)} still to pay</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 13, color: '#075985', lineHeight: 1.6 }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>
                        <b>How bonuses are earned</b>, for each merchant who signs up with an admin&apos;s referral code: {formatCurrency(bonus)} when they first pay after the trial,
                        then {formatCurrency(bonus)} more on their 3rd, 6th and 12th paid month in a row ({formatCurrency(bonus * 4)} at most per merchant).
                        Moving to a yearly plan earns all 4 at once. A month counts as in a row if it starts within 7 days of the last one ending.
                    </span>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                        <thead><tr>{['Admin', 'Role', 'Referral code', 'Referrals', 'Subscribed', 'Earned', 'Paid', 'To pay'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={8} style={{ ...td, color: '#9ca3af' }}>Loading...</td></tr>
                            ) : rows.map(r => (
                                <tr key={r.id} onClick={() => setOpenAdmin(r)} style={{ cursor: 'pointer' }} title="See how this admin earned their bonuses">
                                    <td style={td}><b style={{ color: '#6c9e4e' }}>{r.name}</b><div style={{ fontSize: 11, color: '#9ca3af' }}>{r.email}</div></td>
                                    <td style={td}>{r.role}</td>
                                    <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{r.referralCode || '—'}</td>
                                    <td style={{ ...td, fontWeight: 700 }}>{r.referrals}</td>
                                    <td style={td}>{r.subscribed}</td>
                                    <td style={{ ...td, fontWeight: 700, color: '#1a1a2e' }}>{formatCurrency(r.earned)}</td>
                                    <td style={td}>{formatCurrency(r.paid)}</td>
                                    <td style={{ ...td, fontWeight: 700, color: r.unpaid > 0 ? '#b45309' : '#9ca3af' }}>{formatCurrency(r.unpaid)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {openAdmin && (
                <Modal isOpen onClose={() => setOpenAdmin(null)} title={`${openAdmin.name}: referral bonuses`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                            {openAdmin.role} · code <b style={{ fontFamily: 'monospace', color: '#1a1a2e' }}>{openAdmin.referralCode || '—'}</b> · {formatCurrency(openAdmin.earned)} earned, {formatCurrency(openAdmin.unpaid)} to pay
                        </div>
                        {loadingDetail ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading...</div> :
                            (detail?.merchants || []).length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No merchants have signed up with this admin&apos;s code yet.</div> :
                                (detail?.merchants || []).map((m: any) => (
                                    <div key={m.businessId} style={{ border: '1px solid #f0f0f0', borderRadius: 12, padding: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                            <Link href={`/inventory/businesses/${m.businessId}`} style={{ fontWeight: 700, color: '#6c9e4e', textDecoration: 'none' }}>{m.businessName}</Link>
                                            <span style={{ fontSize: 12, color: '#9ca3af' }}>Referred {fmtDate(m.referredAt)} · {m.paidMonths} paid subscription{m.paidMonths === 1 ? '' : 's'}</span>
                                        </div>
                                        {m.bonuses.length === 0 ? <div style={{ fontSize: 12, color: '#9ca3af' }}>No bonus yet. The first one comes when they pay after the trial.</div> :
                                            m.bonuses.map((b: any) => (
                                                <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid #f5f5f5', fontSize: 13 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <b style={{ color: '#1a1a2e' }}>{formatCurrency(b.amount)}</b> · {b.label}
                                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.via}, {fmtDate(b.earnedAt)}{b.paid && b.paidAt ? ` · paid ${fmtDate(b.paidAt)}` : ''}</div>
                                                    </div>
                                                    <button onClick={() => togglePaid(m, b)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: b.paid ? '#dcfce7' : '#fef3c7', color: b.paid ? '#15803d' : '#b45309' }}>
                                                        {b.paid ? 'Paid ✓' : 'Mark as paid'}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                    </div>
                </Modal>
            )}
        </div>
    );
}
