'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Topbar from '../Topbar';
import { formatCurrency, formatDate, getDaysRemainingColor } from '@/app/lib/utils';
import { Search, CreditCard, RefreshCw, XCircle, CheckCircle, Clock, TrendingUp, Plus, Edit2, Trash2, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { useInventorySubscriptions, useSubscriptionPlans, useInventoryBusinesses } from '@/api/inventory/inventory.queries';
import { useCreateSubscription, useUpdateSubscription, useCancelSubscription, useExtendSubscription, useDeleteSubscription } from '@/api/inventory/inventory.mutations';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import SearchableSelect from '../SearchableSelect';
import ToggleValue from './ToggleValue';
import { compactNaira, fullNaira, compactCount, fullCount } from './formatNumbers';

const STATUS_OPTIONS = ['All', 'Active', 'Trial', 'Expired', 'Cancelled', 'Unpaid checkout'];
const BILLING_OPTIONS = ['All', 'Monthly', 'Annual'];

const statusStyle: Record<string, { bg: string; color: string }> = {
    Active: { bg: '#dcfce7', color: '#15803d' },
    Trial: { bg: '#fef9c3', color: '#a16207' },
    Expired: { bg: '#fee2e2', color: '#dc2626' },
    Cancelled: { bg: '#f3f4f6', color: '#6b7280' },
    'Unpaid checkout': { bg: '#fff7ed', color: '#c2410c' },
};

const toYMD = (d: Date) => d.toISOString().split('T')[0];
const isYearly = (frequency?: string) => ['yearly', 'annual'].includes((frequency || '').toLowerCase());
// End date one billing period after the start, matching the plan
const periodEnd = (start: string, frequency?: string) => {
    const d = new Date(`${start}T00:00:00`);
    if (isNaN(d.getTime())) return '';
    if (isYearly(frequency)) d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function SubscriptionsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [billingFilter, setBillingFilter] = useState('All');

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const { data: subscriptionsResponse, isLoading } = useInventorySubscriptions({
        page,
        pageSize,
        search: debouncedSearch,
        plan: planFilter === 'All' ? '' : planFilter,
        status: statusFilter === 'All' ? '' : statusFilter,
        billing: billingFilter === 'All' ? '' : billingFilter,
    });

    const [businessSelectSearch, setBusinessSelectSearch] = useState('');
    const { data: plansData } = useSubscriptionPlans();
    const { data: businessesData, isFetching: isBusinessesFetching } = useInventoryBusinesses(1, 50, businessSelectSearch);

    const createSubMutation = useCreateSubscription();
    const updateSubMutation = useUpdateSubscription();
    const cancelSubMutation = useCancelSubscription();
    const extendSubMutation = useExtendSubscription();
    const deleteSubMutation = useDeleteSubscription();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        businessId: '',
        planId: '',
        startsAt: new Date().toISOString().split('T')[0],
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billingCycle: 'Monthly',
        status: 'Active',
        paymentMethod: 'Paystack'
    });

    const handleOpenModal = (sub?: any) => {
        if (sub) {
            setEditingSub(sub);
            setFormData({
                businessId: sub.businessId || '',
                planId: sub.planId || (plansData?.find(p => p.name === sub.plan)?.id || ''),
                startsAt: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : '',
                endsAt: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '',
                billingCycle: sub.billingCycle || 'Monthly',
                // Trial and unpaid checkout can't be set by hand; treat them as expired
                status: ['Active', 'Expired', 'Cancelled'].includes(sub.status) ? sub.status : 'Expired',
                paymentMethod: sub.paymentMethod || 'Paystack'
            });
        } else {
            setEditingSub(null);
            const firstPlan = plansData?.[0];
            const start = toYMD(new Date());
            setFormData({
                // Pick the merchant on purpose rather than defaulting to whoever is first in the list
                businessId: '',
                planId: firstPlan?.id || '',
                startsAt: start,
                endsAt: periodEnd(start, firstPlan?.frequency),
                billingCycle: 'Monthly',
                status: 'Active',
                paymentMethod: 'Paystack'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveSubscription = async () => {
        if (!formData.businessId || !formData.planId) {
            toast.error('Merchant and Plan are required');
            return;
        }

        try {
            if (editingSub) {
                await updateSubMutation.mutateAsync({
                    id: editingSub.id,
                    dto: {
                        planId: formData.planId,
                        startDate: formData.startsAt,
                        endDate: formData.endsAt,
                        status: formData.status
                    }
                });
            } else {
                await createSubMutation.mutateAsync({
                    businessId: formData.businessId,
                    planId: formData.planId,
                    startsAt: formData.startsAt,
                    endsAt: formData.endsAt,
                    billingCycle: formData.billingCycle,
                    paymentMethod: formData.paymentMethod
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            // Handled by mutation
        }
    };

    // Confirm Action Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'cancel' | 'extend' | 'delete';
        sub: any;
    }>({ isOpen: false, type: 'cancel', sub: null });

    const handleAction = (type: 'edit' | 'cancel' | 'extend' | 'delete', sub: any) => {
        if (type === 'edit') {
            handleOpenModal(sub);
        } else {
            setConfirmModal({ isOpen: true, type, sub });
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.sub) return;
        const sub = confirmModal.sub;
        try {
            if (confirmModal.type === 'cancel') {
                await cancelSubMutation.mutateAsync(sub.id);
            } else if (confirmModal.type === 'extend') {
                await extendSubMutation.mutateAsync({ id: sub.id, days: 30 });
            } else if (confirmModal.type === 'delete') {
                await deleteSubMutation.mutateAsync(sub.id);
            }
            setConfirmModal({ isOpen: false, type: 'cancel', sub: null });
        } catch (err) {
            // Handled by mutation toast
        }
    };

    const rawSubscriptions = subscriptionsResponse?.data || [];
    // The server already returns newest first across all pages
    const subscriptions = rawSubscriptions;
    const aggregates: any = subscriptionsResponse?.aggregates || {
        totalActive: rawSubscriptions.filter(s => s.status === 'Active').length,
        totalTrial: rawSubscriptions.filter(s => s.status === 'Trial').length,
        totalExpired: rawSubscriptions.filter(s => s.status === 'Expired').length,
        totalCancelled: rawSubscriptions.filter(s => s.status === 'Cancelled').length,
        totalMRR: rawSubscriptions.filter(s => s.status === 'Active' && s.billingCycle === 'Monthly').reduce((acc, s) => acc + (s.amountPaying || 0), 0),
        totalARR: rawSubscriptions.filter(s => s.status === 'Active' && s.billingCycle === 'Annual').reduce((acc, s) => acc + (s.amountPaying || 0), 0),
    };
    const totalCount = subscriptionsResponse?.meta?.total || 0;

    const thStyle: React.CSSProperties = {
        padding: '11px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0',
        background: '#f9fafb', whiteSpace: 'nowrap',
    };
    const tdStyle: React.CSSProperties = {
        padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5',
    };

    const planOptions = ['All', ...(plansData?.map(p => p.name) || ['Enterprise', 'Pro', 'Basic', 'Basic Helfer'])];

    return (
        <div>
            <Topbar title="Subscriptions" subtitle="Manage all merchant subscription plans, payments, and renewals." product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                    {[
                        // Short by default (1.2K, ₦375K); click a figure for the exact value
                        { label: 'Total Value', money: aggregates.totalValue ?? 0, icon: <CreditCard size={18} />, accent: '#0f766e', sub: 'All time, paid subscriptions' },
                        { label: 'Active', count: aggregates.totalActive, icon: <CheckCircle size={18} />, accent: '#22c55e', sub: 'Paid & current' },
                        { label: 'On Trial', count: aggregates.totalTrial, icon: <Clock size={18} />, accent: '#f59e0b', sub: 'Free trial period' },
                        { label: 'Expired', count: aggregates.totalExpired, icon: <XCircle size={18} />, accent: '#ef4444', sub: 'Ended, not renewed yet' },
                        { label: 'Cancelled', count: aggregates.totalCancelled, icon: <XCircle size={18} />, accent: '#6b7280', sub: 'Churned' },
                        { label: 'MRR', money: aggregates.totalMRR, icon: <CreditCard size={18} />, accent: '#6c9e4e', sub: 'Active subs per month (yearly ÷ 12)' },
                        { label: 'ARR', money: aggregates.totalARR, icon: <TrendingUp size={18} />, accent: '#7c5cbf', sub: 'MRR × 12' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: `3px solid ${k.accent}` }}>
                            <div style={{ color: k.accent, marginBottom: 8 }}>{k.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 2 }}>
                                {isLoading ? '...' : k.money !== undefined
                                    ? <ToggleValue short={compactNaira(k.money)} full={fullNaira(k.money)} />
                                    : <ToggleValue short={compactCount(k.count)} full={fullCount(k.count)} />}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{k.label}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{k.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e', flex: 1 }}>
                            All Subscriptions <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 13 }}>({isLoading ? '...' : totalCount})</span>
                        </h3>

                        {/* Search */}
                        <div style={{ position: 'relative', minWidth: 220 }}>
                            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search merchant or plan…"
                                style={{ paddingLeft: 30, width: '100%', height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, outline: 'none', color: '#1a1a2e', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Filters */}
                        {[
                            { label: 'Plan', value: planFilter, setValue: setPlanFilter, options: planOptions },
                            { label: 'Status', value: statusFilter, setValue: setStatusFilter, options: STATUS_OPTIONS },
                            { label: 'Billing', value: billingFilter, setValue: setBillingFilter, options: BILLING_OPTIONS },
                        ].map(f => (
                            <select key={f.label} value={f.value} onChange={e => { f.setValue(e.target.value); setPage(1); }}
                                style={{ height: 34, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 12, background: '#f9fafb', outline: 'none', color: '#374151', cursor: 'pointer' }}>
                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ))}

                        <button
                            onClick={() => handleOpenModal()}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 34, background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <Plus size={14} /> Assign Subscription
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                            <thead>
                                <tr>
                                    {['Merchant', 'Plan', 'Payment Method', 'Start Date', 'End Date', 'Days Remaining', 'Amount', 'Billing', 'Auto-Renew', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td colSpan={11} style={{ padding: '12px 14px' }}>
                                                <div style={{ height: 20, background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                                            No subscriptions match your filters.
                                        </td>
                                    </tr>
                                ) : subscriptions.map((s, i) => {
                                    const daysColor = getDaysRemainingColor(s.daysRemaining);
                                    const sc = statusStyle[s.status] || { bg: '#f3f4f6', color: '#6b7280' };
                                    return (
                                        <tr key={s.id}
                                            style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}>

                                            {/* Business */}
                                            <td style={tdStyle}>
                                                <Link href={`/inventory/businesses/${s.businessId}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 13 }}>{s.businessName}</div>
                                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.businessEmail}</div>
                                                </Link>
                                            </td>

                                            {/* Plan */}
                                            <td style={tdStyle}>
                                                <span style={{ padding: '3px 10px', background: '#eaf4e3', color: '#5b8441', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{s.plan}</span>
                                            </td>

                                            {/* Payment Method */}
                                            <td style={{ ...tdStyle, fontSize: 12, color: '#6b7280' }}>{s.paymentMethod || '—'}</td>

                                            {/* Dates */}
                                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{s.startDate ? formatDate(s.startDate) : '—'}</td>
                                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{s.endDate ? formatDate(s.endDate) : '—'}</td>

                                            {/* Days Remaining */}
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: 700, color: daysColor, fontSize: 13 }}>
                                                    {s.status === 'Cancelled' || s.status === 'Unpaid checkout' ? '—' : s.daysRemaining < 0 ? `${Math.abs(s.daysRemaining)}d overdue` : `${s.daysRemaining}d`}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td style={{ ...tdStyle, fontWeight: 700, color: s.amountPaying > 0 ? '#1a1a2e' : '#9ca3af', whiteSpace: 'nowrap' }}>
                                                {s.amountPaying > 0 ? formatCurrency(s.amountPaying) : 'Free'}
                                            </td>

                                            {/* Billing */}
                                            <td style={tdStyle}>
                                                <span style={{ padding: '2px 8px', background: s.billingCycle === 'Annual' ? '#eaf4e3' : '#f3f4f6', color: s.billingCycle === 'Annual' ? '#5b8441' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    {s.billingCycle}
                                                </span>
                                            </td>

                                            {/* Auto-Renew */}
                                            <td style={tdStyle}>
                                                {s.autoRenew
                                                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 12, fontWeight: 600 }}><RefreshCw size={12} /> Yes</span>
                                                    : <span style={{ color: '#9ca3af', fontSize: 12 }}>No</span>}
                                            </td>

                                            {/* Status */}
                                            <td style={tdStyle}>
                                                <span style={{ padding: '3px 10px', background: sc.bg, color: sc.color, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                                    {s.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        onClick={() => handleAction('edit', s)}
                                                        style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }} title="Edit"><Edit2 size={13} /></button>
                                                    <button
                                                        onClick={() => handleAction('extend', s)}
                                                        style={{ background: '#ecfdf5', border: 'none', color: '#059669', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }} title="Extend +30 Days"><Clock size={13} /></button>
                                                    <button
                                                        onClick={() => handleAction('cancel', s)}
                                                        style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }} title="Cancel"><XCircle size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Showing <b style={{ color: '#1a1a2e' }}>{isLoading ? '...' : subscriptions.length}</b> of {isLoading ? '...' : totalCount} subscriptions</span>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalCount / pageSize) || 1}
                            onPageChange={setPage}
                            totalItems={totalCount}
                            pageSize={pageSize}
                            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSub ? 'Edit Subscription' : 'Assign New Subscription'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveSubscription}
                            disabled={createSubMutation.isPending || updateSubMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createSubMutation.isPending || updateSubMutation.isPending ? 'Saving...' : editingSub ? 'Save Changes' : 'Assign Subscription'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Select Merchant
                        </label>
                        {editingSub ? (
                            <input
                                value={editingSub.businessName}
                                disabled
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f3f4f6', color: '#6b7280' }}
                            />
                        ) : (
                            <SearchableSelect
                                value={formData.businessId}
                                onChange={val => setFormData(prev => ({ ...prev, businessId: val }))}
                                onSearch={setBusinessSelectSearch}
                                isLoading={isBusinessesFetching}
                                placeholder="Select or search merchant..."
                                searchPlaceholder="Type merchant name or email..."
                                options={businessesData?.data?.map(b => ({
                                    value: b.id,
                                    label: b.name,
                                    subLabel: b.email || (b as any).ownerEmail
                                })) || []}
                            />
                        )}
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <ShieldCheck size={14} /> Subscription Plan
                        </label>
                        <SearchableSelect
                            value={formData.planId}
                            onChange={val => setFormData(prev => ({ ...prev, planId: val, endsAt: periodEnd(prev.startsAt, plansData?.find(p => String(p.id) === String(val))?.frequency) || prev.endsAt }))}
                            placeholder="Select or search plan..."
                            searchPlaceholder="Search plans..."
                            options={plansData?.map(p => ({
                                value: p.id,
                                label: `${p.name} - ${formatCurrency(p.price)} / ${p.frequency}`,
                                subLabel: p.description
                            })) || []}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Calendar size={14} /> Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startsAt}
                                onChange={e => setFormData(prev => ({ ...prev, startsAt: e.target.value, endsAt: periodEnd(e.target.value, plansData?.find(p => String(p.id) === String(prev.planId))?.frequency) || prev.endsAt }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Calendar size={14} /> End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endsAt}
                                onChange={e => setFormData(prev => ({ ...prev, endsAt: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    {editingSub ? (
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                            <SearchableSelect
                                value={formData.status}
                                onChange={val => setFormData(prev => ({ ...prev, status: val }))}
                                placeholder="Select status..."
                                options={['Active', 'Expired', 'Cancelled'].map(s => ({ value: s, label: s }))}
                            />
                        </div>
                    ) : (
                        <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                            This switches off the merchant&apos;s current subscription and starts this one, marked as paid.
                        </div>
                    )}
                </div>
            </Modal>

            {/* Action Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: 'cancel', sub: null })}
                onConfirm={handleConfirmAction}
                isLoading={cancelSubMutation.isPending || extendSubMutation.isPending || deleteSubMutation.isPending}
                title={
                    confirmModal.type === 'cancel'
                        ? 'Cancel Subscription'
                        : confirmModal.type === 'extend'
                        ? 'Extend Subscription (+30 Days)'
                        : 'Delete Subscription Record'
                }
                description={
                    confirmModal.type === 'cancel'
                        ? `Are you sure you want to cancel the subscription for "${confirmModal.sub?.businessName}"? The business will lose active features upon expiry.`
                        : confirmModal.type === 'extend'
                        ? `Extend the billing period for "${confirmModal.sub?.businessName}" by 30 additional days?`
                        : `Are you sure you want to permanently delete the subscription record for "${confirmModal.sub?.businessName}"? This action cannot be undone.`
                }
                details={
                    confirmModal.sub
                        ? [
                              { label: 'Merchant Name', value: confirmModal.sub.businessName },
                              { label: 'Current Plan', value: confirmModal.sub.plan },
                              { label: 'Status', value: confirmModal.sub.status },
                              {
                                  label: confirmModal.type === 'extend' ? 'Action' : 'Billing Cycle',
                                  value:
                                      confirmModal.type === 'extend'
                                          ? '+30 Days Extension'
                                          : confirmModal.sub.billingCycle || 'Monthly',
                              },
                          ]
                        : []
                }
                confirmText={
                    confirmModal.type === 'cancel'
                        ? 'Cancel Subscription'
                        : confirmModal.type === 'extend'
                        ? 'Extend by 30 Days'
                        : 'Delete Record'
                }
                variant={confirmModal.type === 'extend' ? 'success' : 'danger'}
            />
        </div>
    );
}
