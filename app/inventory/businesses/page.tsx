'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Topbar from '../../../components/Topbar';
import StatusBadge from '../../../components/StatusBadge';
import { formatCurrency, formatDate, getDaysRemainingColor } from '../../lib/utils';
import { Search, Building2, CheckCircle } from 'lucide-react';
import { useInventoryBusinesses } from '@/api/inventory';

const SORT_FILTERS = [
    'Expiring in 5 Days', 'Expiring in 30 Days', 'Trial Ending in 3 Days', 'Failed Payments',
    'Recently Upgraded', 'Converted from Trial', 'High Paying', 'Annual Plan', 'Auto Renew Off',
    'Inactive 30 Days', 'Downgraded Recently',
];


export default function BusinessesPage() {
    const { data: businessesData, isLoading } = useInventoryBusinesses(1, 100); // 100 for now to avoid pagination complexity
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    if (isLoading || !businessesData) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading Businesses...</div>;

    const data = businessesData.data || [];


    const filtered = data.filter(b => {
        const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || b.status === statusFilter;
        let matchFilter = true;
        if (activeFilter === 'Expiring in 5 Days') matchFilter = b.daysRemaining >= 0 && b.daysRemaining <= 5;
        if (activeFilter === 'Expiring in 30 Days') matchFilter = b.daysRemaining >= 0 && b.daysRemaining <= 30;
        if (activeFilter === 'Trial Ending in 3 Days') matchFilter = b.status === 'Trial' && b.daysRemaining <= 3;
        if (activeFilter === 'Annual Plan') matchFilter = b.billingCycle === 'Annual';
        if (activeFilter === 'Auto Renew Off') matchFilter = !b.autoRenew;
        if (activeFilter === 'High Paying') matchFilter = b.amountPaying > 80000;
        return matchSearch && matchStatus && matchFilter;
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);

    const total = data.length;
    const active = data.filter(b => b.status === 'Active').length;

    return (
        <div>
            <Topbar title="Business Management" subtitle="Manage all customer businesses" product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Total Businesses', value: total, color: '#6c9e4e' },
                        { label: 'Active', value: active, color: '#22c55e' },
                        { label: 'Trial', value: data.filter(b => b.status === 'Trial').length, color: '#f59e0b' },
                        { label: 'Expired', value: data.filter(b => b.status === 'Expired').length, color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Sort filter pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {SORT_FILTERS.map(f => (
                        <button key={f} onClick={() => setActiveFilter(activeFilter === f ? '' : f)} style={{
                            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            background: activeFilter === f ? '#6c9e4e' : '#fff',
                            color: activeFilter === f ? '#fff' : '#6b7280',
                            border: activeFilter === f ? '1px solid #6c9e4e' : '1px solid #e5e7eb',
                        }}>
                            {activeFilter === f && <CheckCircle size={10} style={{ marginRight: 4 }} />}{f}
                        </button>
                    ))}
                </div>

                {/* Table Card */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses…" style={{ paddingLeft: 32, width: '100%', height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#1a1a2e', outline: 'none' }} />
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
                                    {['Business Name', 'Joined', 'Status', 'Plan', 'Days Left', 'Amount', 'Billing', 'Renew'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((b, i) => (
                                    <tr key={b.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s', cursor: 'pointer' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f0f9f0')}
                                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                                        <td>
                                            <Link href={`/inventory/businesses/${b.id}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eaf4e3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Building2 size={15} color="#6c9e4e" />
                                                    </div>
                                                    <span style={{ fontWeight: 600, fontSize: 13, color: '#6c9e4e' }}>{b.name}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(b.dateJoined)}</td>
                                        <td><StatusBadge status={b.status} size="sm" /></td>
                                        <td style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{b.currentPlan}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, fontSize: 13, color: getDaysRemainingColor(b.daysRemaining) }}>
                                                {b.daysRemaining < 0 ? `${Math.abs(b.daysRemaining)}d overdue` : `${b.daysRemaining}d`}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{b.amountPaying > 0 ? formatCurrency(b.amountPaying) : '—'}</td>
                                        <td>
                                            <span style={{ padding: '3px 8px', background: b.billingCycle === 'Annual' ? '#eaf4e3' : '#f3f4f6', color: b.billingCycle === 'Annual' ? '#5b8441' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{b.billingCycle}</span>
                                        </td>
                                        <td>
                                            <span style={{ color: b.autoRenew ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{b.autoRenew ? 'Yes' : 'No'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af' }}>
                        Showing {filtered.length} of {total} businesses · Default sort: Days Remaining ASC
                    </div>
                </div>
            </div>
        </div>
    );
}
