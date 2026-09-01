'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import StatusBadge from '../StatusBadge';
import { formatDate, formatDateTime } from '@/app/lib/utils';
import { Search, Edit2, Key, LogOut, Plus, Activity, UserCheck, UserX, Clock } from 'lucide-react';
import { usePlatformUsers, useUserActivities } from '@/api/inventory/inventory.queries';
import { useUpdatePlatformUserStatus } from '@/api/inventory/inventory.mutations';
import { PlatformUserRecord, ActivityLog } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

interface Props {
    product: 'inventory' | 'studio' | 'admin';
}

export default function UsersPageContent({ product }: Props) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const { data: usersResponse, isLoading } = usePlatformUsers({
        page,
        pageSize,
        search,
        status: filterStatus === 'All' ? '' : filterStatus
    });

    const updateStatusMutation = useUpdatePlatformUserStatus();

    // User activity logs drilldown modal
    const [selectedUserForActivity, setSelectedUserForActivity] = useState<PlatformUserRecord | null>(null);
    // Status Confirm Modal State
    const [statusConfirmModal, setStatusConfirmModal] = useState<{
        isOpen: boolean;
        user: PlatformUserRecord | null;
        nextStatus: string;
    }>({ isOpen: false, user: null, nextStatus: 'Active' });

    const { data: activitiesData, isLoading: isActivitiesLoading } = useUserActivities(selectedUserForActivity?.id || '');

    const accentColor = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    const lightBg = product === 'studio' ? '#f0ebff' : '#eaf4e3';

    const rawUsers = usersResponse?.data || [];
    // Sort latest first
    const users = [...rawUsers].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = usersResponse?.meta?.total || users.length;

    const handleToggleStatus = (user: PlatformUserRecord) => {
        const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        setStatusConfirmModal({ isOpen: true, user, nextStatus });
    };

    const handleConfirmStatusChange = async () => {
        if (!statusConfirmModal.user) return;
        try {
            await updateStatusMutation.mutateAsync({
                userId: statusConfirmModal.user.id,
                status: statusConfirmModal.nextStatus
            });
            setStatusConfirmModal({ isOpen: false, user: null, nextStatus: 'Active' });
        } catch (err) { }
    };

    return (
        <div>
            <Topbar title="Platform Users" subtitle="Manage registered platform users, business owners, and access states" product={product} />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Total Users', value: totalCount, color: accentColor },
                        { label: 'Active', value: users.filter(u => u.status === 'Active').length, color: '#22c55e' },
                        { label: 'Suspended', value: users.filter(u => u.status === 'Suspended').length, color: '#f97316' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid #f0f0f0`, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{isLoading ? '...' : s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {/* Filters */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search by name, email, or business…"
                                style={{ paddingLeft: 32, width: '100%', height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#1a1a2e', outline: 'none' }}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={e => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                            }}
                            style={{ height: 36, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 13, background: '#f9fafb', color: '#374151', outline: 'none' }}>
                            <option value="All">All Statuses</option>
                            {['Active', 'Suspended', 'Inactive'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ minWidth: 1000 }}>
                            <thead>
                                <tr>
                                    {['Name', 'Email', 'Role / Business', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                                        <th key={h} style={{ textAlign: h === 'Actions' ? 'center' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td colSpan={7}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No platform users found</td>
                                    </tr>
                                ) : (
                                    users.map((u: PlatformUserRecord, i) => (
                                        <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${accentColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: accentColor, flexShrink: 0 }}>
                                                        {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{u.name || 'Anonymous User'}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                                            <td>
                                                <span style={{ padding: '3px 10px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                                    {u.role || u.businesses?.[0]?.name || 'Platform User'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                    background: u.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                                    color: u.status === 'Active' ? '#166534' : '#991b1b'
                                                }}>
                                                    {u.status || 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 12, color: '#6b7280' }}>{u.lastLogin ? formatDateTime(u.lastLogin) : '—'}</td>
                                            <td style={{ fontSize: 12, color: '#6b7280' }}>{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => setSelectedUserForActivity(u)}
                                                        title="View Activity Logs"
                                                        style={{ background: lightBg, border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: accentColor, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                                                        <Activity size={13} /> Activity
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(u)}
                                                        title={u.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                                        style={{
                                                            background: u.status === 'Active' ? '#fee2e2' : '#dcfce7',
                                                            border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
                                                            color: u.status === 'Active' ? '#dc2626' : '#166534',
                                                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600
                                                        }}>
                                                        {u.status === 'Active' ? <UserX size={13} /> : <UserCheck size={13} />}
                                                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {users.length} of {totalCount} users</span>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalCount / pageSize) || 1}
                            onPageChange={setPage}
                            totalItems={totalCount}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            {/* Activity Modal */}
            <Modal
                isOpen={!!selectedUserForActivity}
                onClose={() => setSelectedUserForActivity(null)}
                title={`User Activities: ${selectedUserForActivity?.name || selectedUserForActivity?.email}`}
                footer={
                    <button onClick={() => setSelectedUserForActivity(null)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>Close</button>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 350, overflowY: 'auto' }}>
                    {isActivitiesLoading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Loading activity trail...</div>
                    ) : (() => {
                        const activities = (activitiesData as any)?.data || (Array.isArray(activitiesData) ? activitiesData : []);
                        if (activities.length === 0) {
                            return <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No recent activity records found for this user.</div>;
                        }
                        return activities.map((act: ActivityLog) => (
                            <div key={act.id} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8, borderLeft: `3px solid ${accentColor}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>{act.action}</span>
                                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatDateTime(act.timestamp)}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{act.details || 'User session event recorded'}</div>
                            </div>
                        ));
                    })()}
                </div>
            </Modal>

            {/* Change Status Confirmation Modal */}
            <ConfirmModal
                isOpen={statusConfirmModal.isOpen}
                onClose={() => setStatusConfirmModal({ isOpen: false, user: null, nextStatus: 'Active' })}
                onConfirm={handleConfirmStatusChange}
                isLoading={updateStatusMutation.isPending}
                title={statusConfirmModal.nextStatus === 'Active' ? 'Activate User Account' : 'Suspend User Account'}
                description={
                    statusConfirmModal.nextStatus === 'Active'
                        ? `Are you sure you want to activate user "${statusConfirmModal.user?.name || statusConfirmModal.user?.email}"? They will regain access to platform workspaces.`
                        : `Are you sure you want to suspend user "${statusConfirmModal.user?.name || statusConfirmModal.user?.email}"? They will be immediately locked out of platform workspaces.`
                }
                details={
                    statusConfirmModal.user
                        ? [
                              { label: 'User Name', value: statusConfirmModal.user.name || '—' },
                              { label: 'Email', value: statusConfirmModal.user.email },
                              { label: 'Current Status', value: statusConfirmModal.user.status },
                              { label: 'New Status', value: statusConfirmModal.nextStatus },
                          ]
                        : []
                }
                confirmText={statusConfirmModal.nextStatus === 'Active' ? 'Activate Account' : 'Suspend Account'}
                variant={statusConfirmModal.nextStatus === 'Active' ? 'success' : 'warning'}
            />
        </div>
    );
}
