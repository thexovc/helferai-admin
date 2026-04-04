'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Topbar from '../../../components/Topbar';
import { formatCurrency, formatDate } from '../../lib/utils';
import { SkeletonPulse, KPISkeleton, TableSkeleton } from '@/components/Skeleton';
import { Search, Building2, CheckCircle, Plus, Edit2, Trash2, Globe, Mail } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useInventoryBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness, SubStatus, BillingCycle } from '@/api/inventory';
import { toast } from 'sonner';
import Modal from '@/components/Modal';

const SORT_FILTERS = [
    'Expiring in 5 Days', 'Expiring in 30 Days', 'Trial Ending in 3 Days', 'Failed Payments',
    'Recently Upgraded', 'Converted from Trial', 'High Paying', 'Annual Plan', 'Auto Renew Off',
    'Inactive 30 Days', 'Downgraded Recently',
];

export default function BusinessesPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Debounce search effect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 500ms delay

        return () => clearTimeout(handler);
    }, [search]);

    // Mapper for API filters
    const filterKey = (() => {
        if (activeFilter) {
            const map: Record<string, string> = {
                'Expiring in 5 Days': 'expiring_5d',
                'Expiring in 30 Days': 'expiring_30d',
                'Trial Ending in 3 Days': 'trial_ending_3d',
                'Failed Payments': 'failed_payments',
                'High Paying': 'high_paying',
                'Annual Plan': 'annual_plan',
                'Auto Renew Off': 'auto_renew_off',
                'Inactive 30 Days': 'inactive_30d',
                'Recently Upgraded': 'recently_upgraded', // (Currently not handled in API but can be added)
                'Converted from Trial': 'converted_trial',
                'Downgraded Recently': 'recently_downgraded'
            };
            return map[activeFilter] || '';
        }
        if (statusFilter !== 'All') {
            return statusFilter.toLowerCase();
        }
        return '';
    })();

    const { data: businessesResponse, isLoading, isFetching } = useInventoryBusinesses(page, pageSize, debouncedSearch, filterKey);
    const createBusiness = useCreateBusiness();
    const updateBusiness = useUpdateBusiness();
    const deleteBusiness = useDeleteBusiness();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<import('@/api/inventory').Business | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        status: 'Active' as SubStatus,
        currentPlan: 'Basic',
        billingCycle: 'Monthly' as BillingCycle,
        amountPaying: 0,
        daysRemaining: 30
    });


    const handleOpenModal = (business?: import('@/api/inventory').Business) => {
        if (business) {
            setEditingBusiness(business);
            setFormData({
                name: business.name,
                email: business.email,
                status: business.status,
                currentPlan: business.currentPlan,
                billingCycle: business.billingCycle,
                amountPaying: business.amountPaying,
                daysRemaining: business.daysRemaining
            });
        } else {
            setEditingBusiness(null);
            setFormData({
                name: '',
                email: '',
                status: 'Active',
                currentPlan: 'Basic',
                billingCycle: 'Monthly',
                amountPaying: 15000,
                daysRemaining: 30
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveBusiness = () => {
        if (!formData.name || !formData.email) {
            toast.error('Business name and email are required');
            return;
        }

        if (editingBusiness) {
            updateBusiness.mutate(
                { id: editingBusiness.id, data: formData },
                {
                    onSuccess: () => setIsModalOpen(false)
                }
            );
        } else {
            createBusiness.mutate(formData, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleDeleteBusiness = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            deleteBusiness.mutate(id);
        }
    };

    // Only show full page skeleton if it's the INITIAL load AND we have no data
    const businesses = businessesResponse?.data || [];
    const isInitialLoading = isLoading && businesses.length === 0;

    if (isInitialLoading) {
        return (
            <div>
                <Topbar title="Business Management" subtitle="Manage all customer businesses" product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                        {Array(4).fill(0).map((_, i) => <KPISkeleton key={i} />)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                        {Array(5).fill(0).map((_, i) => <SkeletonPulse key={i} width={100} height={30} borderRadius={99} />)}
                    </div>
                    <TableSkeleton rows={8} cols={7} />
                </div>
            </div>
        );
    }

    const meta = businessesResponse?.meta || { total: 0, page: 1, pageSize: 10 };
    const filtered = businesses;

    return (
        <div>
            <Topbar title="Business Management" subtitle="Manage all customer businesses" product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Total Businesses', value: meta.total, color: '#6c9e4e' },
                        { label: 'Active', value: filtered.filter(b => b.status === 'Active').length, color: '#22c55e' },
                        { label: 'Trial', value: filtered.filter(b => b.status === 'Trial').length, color: '#f59e0b' },
                        { label: 'Expired', value: filtered.filter(b => b.status === 'Expired').length, color: '#ef4444' },
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
                        <button key={f} onClick={() => {
                            setActiveFilter(activeFilter === f ? '' : f);
                            setPage(1);
                        }} style={{
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
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: isFetching ? '#6c9e4e' : '#9ca3af' }} />
                            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search businesses…" style={{ paddingLeft: 32, width: '100%', height: 36, borderRadius: 8, border: `1px solid ${isFetching ? '#6c9e4e' : '#e5e7eb'}`, background: '#f9fafb', fontSize: 13, color: '#1a1a2e', outline: 'none' }} />
                        </div>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ height: 36, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 13, background: '#f9fafb', color: '#374151', outline: 'none' }}>
                            <option>All</option>
                            {['Active', 'Trial', 'Expired', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button
                            onClick={() => handleOpenModal()}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            <Plus size={14} /> Add Business
                        </button>
                    </div>

                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ minWidth: 900 }}>
                            <thead>
                                <tr>
                                    {['Business Name', 'Owner', 'Status', 'Current Plan', 'Billing Renewal', 'Paying', 'Cycle', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((b, i) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
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
                                        <td style={{ color: '#6b7280', fontSize: 13 }}>{b.email}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: b.status === 'Active' ? '#dcfce7' : b.status === 'Trial' ? '#fef9c3' : '#fee2e2',
                                                color: b.status === 'Active' ? '#15803d' : b.status === 'Trial' ? '#a16207' : '#dc2626',
                                                borderRadius: 99, fontSize: 11, fontWeight: 700
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{b.currentPlan}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: 13, color: b.daysRemaining < 30 ? '#ef4444' : '#1a1a2e', fontWeight: 600 }}>{b.daysRemaining} days</span>
                                                <span style={{ fontSize: 10, color: '#9ca3af' }}>left in cycle</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#1a1a2e' }}>{formatCurrency(b.amountPaying)}</td>
                                        <td>
                                            <span style={{ padding: '3px 8px', background: b.billingCycle === 'Annual' ? '#eaf4e3' : '#f3f4f6', color: b.billingCycle === 'Annual' ? '#5b8441' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{b.billingCycle}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => handleOpenModal(b)}
                                                    style={{ border: 'none', background: '#f0f9ff', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }} title="Edit"><Edit2 size={14} /></button>
                                                <button
                                                    onClick={() => handleDeleteBusiness(b.id, b.name)}
                                                    style={{ border: 'none', background: '#fee2e2', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }} title="Delete"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(meta.total / pageSize)}
                            onPageChange={setPage}
                            totalItems={meta.total}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBusiness ? 'Edit Business' : 'Add New Business'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button 
                            disabled={createBusiness.isPaused || updateBusiness.isPending || createBusiness.isPending}
                            onClick={handleSaveBusiness} 
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)', opacity: (createBusiness.isPending || updateBusiness.isPending) ? 0.7 : 1 }}>
                            {(createBusiness.isPending || updateBusiness.isPending) ? 'Saving...' : (editingBusiness ? 'Save Changes' : 'Create Business')}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Business Name
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Acme Corp"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Mail size={14} /> Owner Email
                        </label>
                        <input
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="owner@example.com"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Current Plan</label>
                            <select
                                value={formData.currentPlan}
                                onChange={e => setFormData(prev => ({ ...prev, currentPlan: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['Basic', 'Pro', 'Enterprise', 'Trial'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Billing Cycle</label>
                            <select
                                value={formData.billingCycle}
                                onChange={e => setFormData(prev => ({ ...prev, billingCycle: e.target.value as BillingCycle }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['Monthly', 'Annual'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Amount Paying (₦)</label>
                            <input
                                type="number"
                                value={formData.amountPaying}
                                onChange={e => setFormData(prev => ({ ...prev, amountPaying: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as SubStatus }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['Active', 'Trial', 'Expired', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
