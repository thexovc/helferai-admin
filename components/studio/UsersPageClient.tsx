'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Topbar from '../Topbar';
import StatusBadge from '../StatusBadge';
import { StudioService } from '@/app/lib/services/studio';
import { formatCurrency, formatDate, formatDateTime, getDaysRemainingColor } from '@/app/lib/utils';
import { Search, UserCircle, CheckCircle } from 'lucide-react';
import type { StudioUser } from '@/app/lib/types';

const SORT_FILTERS = [
    'Expiring in 5 Days', 'Expiring in 30 Days', 'Trial Ending in 3 Days', 'Failed Payments',
    'Recently Upgraded', 'Converted from Trial', 'High Paying', 'Annual Plan', 'Auto Renew Off', 'Downgraded Recently',
];

export default function StudioUsersPage() {
    const [data, setData] = React.useState<StudioUser[] | null>(null);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    React.useEffect(() => {
        const load = async () => {
            const res = await StudioService.getUsers();
            setData(res);
        };
        load();
    }, []);

    if (!data) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading Users...</div>;

    const filtered = data.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || u.status === statusFilter;
        let matchFilter = true;
        if (activeFilter === 'Annual Plan') matchFilter = u.billingCycle === 'Annual';
        if (activeFilter === 'Auto Renew Off') matchFilter = !u.autoRenew;
        if (activeFilter === 'High Paying') matchFilter = u.amountPaying > 20000;
        if (activeFilter === 'Expiring in 5 Days') matchFilter = u.daysRemaining >= 0 && u.daysRemaining <= 5;
        if (activeFilter === 'Expiring in 30 Days') matchFilter = u.daysRemaining >= 0 && u.daysRemaining <= 30;
        return matchSearch && matchStatus && matchFilter;
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);

    return (
        <div>
            <Topbar title="User Management" subtitle="Manage all Studio users" product="studio" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Total Users', value: data.length, color: '#7c5cbf' },
                        { label: 'Active', value: data.filter(u => u.status === 'Active').length, color: '#22c55e' },
                        { label: 'Trial', value: data.filter(u => u.status === 'Trial').length, color: '#f59e0b' },
                        { label: 'Expired', value: data.filter(u => u.status === 'Expired').length, color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>{s.label}</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Sort pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {SORT_FILTERS.map(f => (
                        <button key={f} onClick={() => setActiveFilter(activeFilter === f ? '' : f)} style={{
                            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: activeFilter === f ? '#7c5cbf' : '#fff',
                            color: activeFilter === f ? '#fff' : '#6b7280',
                            border: activeFilter === f ? '1px solid #7c5cbf' : '1px solid #e5e7eb',
                        }}>
                            {f}
                        </button>
                    ))}
                </div>

                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ paddingLeft: 32, width: '100%', height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#1a1a2e', outline: 'none' }} />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ height: 36, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 13, background: '#f9fafb', color: '#374151', outline: 'none' }}>
                            <option>All</option>
                            {['Active', 'Trial', 'Expired', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ minWidth: 900 }}>
                            <thead>
                                <tr>
                                    {['User Name', 'Joined', 'Status', 'Plan', 'Days Left', 'Amount', 'Billing', 'Renew'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => (
                                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f0ff')}
                                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                                        <td>
                                            <Link href={`/studio/users/${u.id}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0ebff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <UserCircle size={16} color="#7c5cbf" />
                                                    </div>
                                                    <span style={{ fontWeight: 600, fontSize: 13, color: '#7c5cbf' }}>{u.name}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(u.dateJoined)}</td>
                                        <td><StatusBadge status={u.status} size="sm" /></td>
                                        <td style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{u.currentPlan}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, fontSize: 13, color: getDaysRemainingColor(u.daysRemaining) }}>
                                                {u.daysRemaining < 0 ? `${Math.abs(u.daysRemaining)}d overdue` : `${u.daysRemaining}d`}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{u.amountPaying > 0 ? formatCurrency(u.amountPaying) : '—'}</td>
                                        <td>
                                            <span style={{ padding: '3px 8px', background: u.billingCycle === 'Annual' ? '#f0ebff' : '#f3f4f6', color: u.billingCycle === 'Annual' ? '#7c5cbf' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{u.billingCycle}</span>
                                        </td>
                                        <td>
                                            <span style={{ color: u.autoRenew ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{u.autoRenew ? 'Yes' : 'No'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af' }}>
                        Showing {filtered.length} of {data.length} users · Default sort: Days Remaining ASC
                    </div>
                </div>
            </div>
        </div>
    );
}
