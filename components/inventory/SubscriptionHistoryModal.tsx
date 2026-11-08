'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import Modal from '../Modal';
import Pagination from '../Pagination';
import { useBusinessSubscriptions } from '@/api/inventory/inventory.queries';
import { formatDate } from '@/app/lib/utils';
import { fullNaira } from './formatNumbers';

const statusStyle: Record<string, { bg: string; color: string }> = {
    Active: { bg: '#dcfce7', color: '#15803d' },
    Trial: { bg: '#fef9c3', color: '#a16207' },
    Expired: { bg: '#fee2e2', color: '#dc2626' },
    Cancelled: { bg: '#f3f4f6', color: '#6b7280' },
    'Unpaid checkout': { bg: '#fff7ed', color: '#c2410c' },
};

const th: React.CSSProperties = { padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.4, background: '#f9fafb', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', whiteSpace: 'nowrap' };

interface Props {
    merchant: { id: string; name: string; email?: string } | null;
    onClose: () => void;
}

// Every subscription a merchant has had, newest first
export default function SubscriptionHistoryModal({ merchant, onClose }: Props) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    useEffect(() => { setPage(1); }, [merchant?.id]);

    const { data, isLoading } = useBusinessSubscriptions(merchant?.id || '', page, pageSize);
    const rows: any[] = (data as any)?.data || [];
    const total: number = (data as any)?.meta?.total || 0;

    return (
        <Modal
            isOpen={!!merchant}
            onClose={onClose}
            closeOnBackdropClick
            maxWidth={820}
            title={
                <span style={{ display: 'block' }}>
                    <span style={{ display: 'block' }}>Subscription history</span>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginTop: 2 }}>
                        {merchant?.name}{merchant?.email ? ` · ${merchant.email}` : ''}
                    </span>
                </span>
            }
            footer={
                <>
                    {merchant && (
                        <Link href={`/inventory/businesses/${merchant.id}`}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, background: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                            <ExternalLink size={14} /> Open merchant page
                        </Link>
                    )}
                    <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                </>
            }
        >
            <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                    <thead>
                        <tr>{['Plan', 'Amount', 'Start Date', 'End Date', 'Payment', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i}><td colSpan={6} style={{ padding: '12px' }}>
                                    <div style={{ height: 18, background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft" />
                                </td></tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '36px 12px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No subscriptions yet.</td></tr>
                        ) : rows.map((s, i) => {
                            const sc = statusStyle[s.status] || { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                                <tr key={s.id} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                                    <td style={{ ...td, fontWeight: 700, color: '#1a1a2e' }}>{s.plan}</td>
                                    <td style={{ ...td, fontWeight: 700, color: s.amount > 0 ? '#1a1a2e' : '#9ca3af' }}>{s.amount > 0 ? fullNaira(s.amount) : 'Free'}</td>
                                    <td style={td}>{s.startsAt ? formatDate(s.startsAt) : '—'}</td>
                                    <td style={td}>{s.endsAt ? formatDate(s.endsAt) : '—'}</td>
                                    <td style={{ ...td, fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{s.paymentStatus || '—'}</td>
                                    <td style={td}>
                                        <span style={{ padding: '3px 10px', background: sc.bg, color: sc.color, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{s.status}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {total > pageSize && (
                <div style={{ marginTop: 14 }}>
                    <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize) || 1} onPageChange={setPage}
                        totalItems={total} pageSize={pageSize} onPageSizeChange={n => { setPageSize(n); setPage(1); }} />
                </div>
            )}
            {!isLoading && total > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>{total} subscription{total === 1 ? '' : 's'} in total</div>
            )}
        </Modal>
    );
}
