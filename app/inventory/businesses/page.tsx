'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Topbar from '../../../components/Topbar';
import { formatCurrency } from '../../lib/utils';
import { Search, Building2, Plus, Edit2, Trash2, Mail, Loader2 } from 'lucide-react';
import MerchantLogo from '@/components/inventory/MerchantLogo';
import Pagination from '@/components/Pagination';
import { useInventoryBusinesses, useInventoryAdmins } from '@/api/inventory';
import { inventoryApi } from '@/api/inventory/inventory.api';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/api/inventory/inventory.mutations';
import { toast } from 'sonner';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import SearchableSelect from '@/components/SearchableSelect';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import dynamic from 'next/dynamic';

const EmailComposerModal = dynamic(() => import('@/components/EmailComposerModal'), { ssr: false });

const SORT_FILTERS = [
    'Expiring in 5 Days', 'Expiring in 30 Days', 'Trial Ending in 3 Days',
    'Recently Upgraded', 'Converted from Trial', 'High Paying', 'Annual Plan', 'Auto Renew Off',
    'Inactive 30 Days', 'Downgraded Recently',
];

export default function BusinessesPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    // Each filter can hold several values; empty = All
    const [activeFilter, setActiveFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [selectedBizForEmail, setSelectedBizForEmail] = useState<any | null>(null);

    // Debounce search input to avoid re-triggering requests on every keystroke
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Mapper for API filters: quick filters and statuses go together, comma separated
    const QUICK_KEYS: Record<string, string> = {
        'Expiring in 5 Days': 'expiring_5d',
        'Expiring in 30 Days': 'expiring_30d',
        'Trial Ending in 3 Days': 'trial_ending_3d',
        'High Paying': 'high_paying',
        'Annual Plan': 'annual_plan',
        'Auto Renew Off': 'auto_renew_off',
        'Inactive 30 Days': 'inactive_30d',
        'Recently Upgraded': 'recently_upgraded',
        'Converted from Trial': 'converted_trial',
        'Downgraded Recently': 'recently_downgraded'
    };
    const filterKey = [
        ...activeFilter.map(f => QUICK_KEYS[f]).filter(Boolean),
        ...statusFilter.map(f => f.toLowerCase()),
    ].join(',');

    const [managerFilter, setManagerFilter] = useState<string[]>([]);
    const { data: businessesResponse, isLoading, isFetching } = useInventoryBusinesses(page, pageSize, debouncedSearch, filterKey, managerFilter.join(','));
    // Admins who can look after a merchant (Merchant Manager)
    const { data: adminsResponse } = useInventoryAdmins(1, 100, '');
    const adminOptions: any[] = adminsResponse?.data || [];
    const queryClient = useQueryClient();
    const changeManager = async (b: any, adminId: string) => {
        try {
            await inventoryApi.setAccountManager(b.id, adminId || null);
            const name = adminOptions.find(a => a.id === adminId)?.name;
            toast.success(name ? `${b.name} is now managed by ${name}` : `${b.name} has no merchant manager now`);
            queryClient.invalidateQueries({ queryKey: ['inventory', 'businesses'] });
        } catch (err: any) {
            toast.error(err?.message || 'Could not change the merchant manager');
        }
    };

    const createBusinessMutation = useCreateBusiness();
    const updateBusinessMutation = useUpdateBusiness();
    const deleteBusinessMutation = useDeleteBusiness();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        status: 'Active',
        currentPlan: 'Basic',
        billingCycle: 'Monthly',
        amountPaying: 0,
        daysRemaining: 30
    });

    const handleOpenModal = (business?: any) => {
        if (business) {
            setEditingBusiness(business);
            setFormData({
                name: business.name,
                email: business.email,
                status: business.status || 'Active',
                currentPlan: business.currentPlan || 'Basic',
                billingCycle: business.billingCycle || 'Monthly',
                amountPaying: business.amountPaying || 0,
                daysRemaining: business.daysRemaining || 30
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

    const handleSaveBusiness = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Merchant name and email are required');
            return;
        }

        try {
            if (editingBusiness) {
                await updateBusinessMutation.mutateAsync({
                    id: editingBusiness.id,
                    dto: {
                        name: formData.name,
                        email: formData.email,
                        status: formData.status,
                        currentPlan: formData.currentPlan
                    }
                });
            } else {
                await createBusinessMutation.mutateAsync({
                    name: formData.name,
                    email: formData.email,
                    status: formData.status,
                    currentPlan: formData.currentPlan
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            // Handled by mutation
        }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; business: any | null }>({
        isOpen: false,
        business: null,
    });

    const handleDeleteBusiness = (business: any) => {
        setDeleteModal({ isOpen: true, business });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.business) return;
        try {
            await deleteBusinessMutation.mutateAsync(deleteModal.business.id);
            setDeleteModal({ isOpen: false, business: null });
        } catch (err) { }
    };

    // The server already sends newest registrations first
    const businesses = businessesResponse?.data || [];
    const meta = businessesResponse?.meta || { total: businesses.length, page: 1, pageSize: 10 };
    const stats = (businessesResponse as any)?.stats as { total: number; active: number; trial: number; expired: number } | undefined;

    return (
        <div>
            <Topbar title="Merchant Management" subtitle="Manage all merchants, subscription cycles, and profiles. Newest sign-ups first." product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        // Counted on the server across all matching merchants, by subscription
                        { label: 'Total Merchants', value: stats?.total ?? meta.total, color: '#6c9e4e' },
                        { label: 'Active (paying)', value: stats?.active ?? 0, color: '#22c55e' },
                        { label: 'On Trial', value: stats?.trial ?? 0, color: '#f59e0b' },
                        { label: 'Expired / No Plan', value: stats?.expired ?? 0, color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{isLoading && !businessesResponse ? '...' : s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Quick filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <MultiSelectFilter label="Show" height={38} options={SORT_FILTERS} selected={activeFilter}
                        onChange={v => { setActiveFilter(v); setPage(1); }} />
                </div>

                {/* Table Card */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search businesses by name, email, or plan…"
                                style={{ paddingLeft: 32, width: '100%', height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#1a1a2e', outline: 'none' }}
                            />
                            {isFetching && (
                                <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6c9e4e' }} />
                            )}
                        </div>
                        <MultiSelectFilter label="Status" height={36} options={['Active', 'Trial', 'Expired', 'Cancelled']} selected={statusFilter}
                            onChange={v => { setStatusFilter(v); setPage(1); }} />
                        <MultiSelectFilter label="Merchant manager" height={36} selected={managerFilter}
                            options={[{ value: 'none', label: 'No merchant manager' }, ...adminOptions.map(a => ({ value: String(a.id), label: a.name }))]}
                            onChange={v => { setManagerFilter(v); setPage(1); }} />
                        <button
                            onClick={() => handleOpenModal()}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            <Plus size={14} /> Add Merchant
                        </button>
                    </div>

                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ minWidth: 1040 }}>
                            <thead>
                                <tr>
                                    {['Merchant Name', 'Owner', 'Merchant Manager', 'Date Created', 'Status', 'Current Plan', 'Billing Renewal', 'Paying', 'Cycle', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && !businessesResponse ? (
                                    [1, 2, 3, 4, 5].map((item) => (
                                        <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td colSpan={10}><div style={{ height: 32, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        </tr>
                                    ))
                                ) : businesses.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>No merchants found matching your search.</td>
                                    </tr>
                                ) : (
                                    businesses.map((b, i) => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td>
                                                <Link href={`/inventory/businesses/${b.id}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <MerchantLogo name={b.name} logo={b.logo} />
                                                        <span style={{ fontWeight: 600, fontSize: 13, color: '#6c9e4e' }}>{b.name}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: 13 }}>{b.email}</td>
                                            <td>
                                                <select
                                                    value={(b as any).accountManager?.id || ''}
                                                    onChange={e => changeManager(b, e.target.value)}
                                                    title="Account manager for this merchant"
                                                    style={{ height: 30, maxWidth: 160, borderRadius: 6, border: '1px solid #e5e7eb', padding: '0 6px', fontSize: 12, background: (b as any).accountManager ? '#eaf4e3' : '#fff', color: (b as any).accountManager ? '#3f7d2c' : '#9ca3af', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                                                    <option value="">Not assigned</option>
                                                    {adminOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: 13, whiteSpace: 'nowrap' }}>
                                                {b.dateJoined ? new Date(b.dateJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </td>
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
                                                    <span style={{ fontSize: 13, color: (b.daysRemaining || 30) < 30 ? '#ef4444' : '#1a1a2e', fontWeight: 600 }}>{b.daysRemaining ?? 30} days</span>
                                                    <span style={{ fontSize: 10, color: '#9ca3af' }}>left in cycle</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#1a1a2e' }}>{formatCurrency(b.amountPaying || 0)}</td>
                                            <td>
                                                <span style={{ padding: '3px 8px', background: b.billingCycle === 'Annual' ? '#eaf4e3' : '#f3f4f6', color: b.billingCycle === 'Annual' ? '#5b8441' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{b.billingCycle || 'Monthly'}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        onClick={() => setSelectedBizForEmail(b)}
                                                        style={{ border: 'none', background: '#eaf4e3', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#166534', display: 'flex' }} title="Send Formatted Email"><Mail size={14} /></button>
                                                    <button
                                                        onClick={() => handleOpenModal(b)}
                                                        style={{ border: 'none', background: '#f0f9ff', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }} title="Edit"><Edit2 size={14} /></button>
                                                    <button
                                                        onClick={() => handleDeleteBusiness(b)}
                                                        style={{ border: 'none', background: '#fee2e2', padding: 6, borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }} title="Delete"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(meta.total / pageSize) || 1}
                            onPageChange={setPage}
                            totalItems={meta.total}
                            pageSize={pageSize}
                            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBusiness ? 'Edit Merchant' : 'Add New Merchant'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveBusiness}
                            disabled={createBusinessMutation.isPending || updateBusinessMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createBusinessMutation.isPending || updateBusinessMutation.isPending ? 'Saving...' : editingBusiness ? 'Save Changes' : 'Create Merchant'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Merchant Name
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
                            <SearchableSelect
                                value={formData.currentPlan}
                                onChange={val => setFormData(prev => ({ ...prev, currentPlan: val }))}
                                placeholder="Select plan..."
                                options={['Basic', 'Pro', 'Enterprise', 'Trial'].map(p => ({ value: p, label: p }))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                            <SearchableSelect
                                value={formData.status}
                                onChange={val => setFormData(prev => ({ ...prev, status: val }))}
                                placeholder="Select status..."
                                options={['Active', 'Trial', 'Expired', 'Cancelled'].map(s => ({ value: s, label: s }))}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Merchant Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, business: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteBusinessMutation.isPending}
                title="Delete Merchant"
                description={`Are you sure you want to permanently delete "${deleteModal.business?.name}"? All associated inventory records, team users, and subscriptions will be deleted.`}
                details={
                    deleteModal.business
                        ? [
                              { label: 'Merchant Name', value: deleteModal.business.name },
                              { label: 'Owner Email', value: deleteModal.business.email },
                              { label: 'Current Plan', value: deleteModal.business.currentPlan || 'Basic' },
                              { label: 'Status', value: deleteModal.business.status || 'Active' },
                          ]
                        : []
                }
                confirmText="Delete Merchant"
                variant="danger"
            />

            {/* Email Composer Modal */}
            <EmailComposerModal
                isOpen={!!selectedBizForEmail}
                onClose={() => setSelectedBizForEmail(null)}
                initialTarget={selectedBizForEmail ? {
                    mode: 'direct',
                    recipientBusiness: {
                        id: selectedBizForEmail.id,
                        name: selectedBizForEmail.name,
                        email: selectedBizForEmail.email,
                    }
                } : undefined}
            />
        </div>
    );
}
