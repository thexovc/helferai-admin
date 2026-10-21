'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, ShieldCheck, Edit2, Trash2, Mail, Lock, User } from 'lucide-react';
import { useInventoryAdmins, useInventoryRoles } from '@/api/inventory/inventory.queries';
import { useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from '@/api/inventory/inventory.mutations';
import { AdminUserRecord } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import SearchableSelect from '../SearchableSelect';

// Backend sends the role as its name; older shapes had { name }
const roleName = (a: any) => (typeof a?.role === 'string' ? a.role : a?.role?.name) || 'No role';

export default function AdminsPageClient({ embedded = false }: { embedded?: boolean }) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const { data: adminsResponse, isLoading } = useInventoryAdmins(page, pageSize, search);
    const { data: rolesResponse } = useInventoryRoles(1, 100);

    const createAdminMutation = useCreateAdmin();
    const updateAdminMutation = useUpdateAdmin();
    const deleteAdminMutation = useDeleteAdmin();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUserRecord | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: '',
        isActive: true
    });

    const handleOpenModal = (admin?: AdminUserRecord) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                name: admin.name || '',
                email: admin.email || '',
                password: '',
                roleId: admin.roleId || '',
                isActive: admin.isActive !== false
            });
        } else {
            setEditingAdmin(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                roleId: rolesResponse?.data?.[0]?.id || '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required');
            return;
        }

        if (!editingAdmin && !formData.password) {
            toast.error('Password is required for new admin');
            return;
        }

        try {
            if (editingAdmin) {
                await updateAdminMutation.mutateAsync({
                    id: editingAdmin.id,
                    dto: {
                        name: formData.name,
                        email: formData.email,
                        roleId: formData.roleId,
                        isActive: formData.isActive
                    }
                });
            } else {
                await createAdminMutation.mutateAsync({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    roleId: formData.roleId
                });
            }
            setIsModalOpen(false);
        } catch (err) { }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; admin: AdminUserRecord | null }>({
        isOpen: false,
        admin: null,
    });

    const handleDelete = (admin: AdminUserRecord) => {
        setDeleteModal({ isOpen: true, admin });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.admin) return;
        try {
            await deleteAdminMutation.mutateAsync(deleteModal.admin.id);
            setDeleteModal({ isOpen: false, admin: null });
        } catch (err) { }
    };

    const rawAdmins = adminsResponse?.data || [];
    // Sort latest first
    const admins = [...rawAdmins].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = adminsResponse?.meta?.total || admins.length;

    return (
        <div>
            {!embedded && <Topbar title="Admins" subtitle="Manage administrative accounts, credentials, and role assignments." product="inventory" />}

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Admin Users</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize platform admin accounts.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> Add Admin
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search admin users by name or email..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Admin Name</th>
                                <th>Email</th>
                                <th>Assigned Role</th>
                                <th>Last sign-in</th>
                                <th>Added</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No admin users found</td>
                                </tr>
                            ) : admins.map((admin: AdminUserRecord) => (
                                <tr key={admin.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{admin.name}</td>
                                    <td style={{ color: '#6b7280' }}>{admin.email}</td>
                                    <td>
                                        <span style={{ padding: '3px 10px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                            {roleName(admin)}
                                        </span>
                                    </td>
                                    <td style={{ color: '#6b7280', fontSize: 12 }}>{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Not recorded yet'}</td>
                                    <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(admin)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin)}
                                                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px' }}>
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
                title={editingAdmin ? 'Edit Admin' : 'Add Admin User'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={createAdminMutation.isPending || updateAdminMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createAdminMutation.isPending || updateAdminMutation.isPending ? 'Saving...' : editingAdmin ? 'Save Changes' : 'Create Admin'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <User size={14} /> Full Name
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Jane Doe"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Mail size={14} /> Admin Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="admin@helfer.ai"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    {!editingAdmin && (
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Lock size={14} /> Initial Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••••••"
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Assign Role</label>
                        <SearchableSelect
                            value={formData.roleId}
                            onChange={val => setFormData(prev => ({ ...prev, roleId: val }))}
                            placeholder="Select role..."
                            searchPlaceholder="Search roles..."
                            options={rolesResponse?.data?.map(r => ({
                                value: r.id,
                                label: r.name,
                                subLabel: r.description
                            })) || []}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Admin Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, admin: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteAdminMutation.isPending}
                title="Revoke Admin Access"
                description={`Are you sure you want to delete and revoke admin credentials for "${deleteModal.admin?.name}"?`}
                details={
                    deleteModal.admin
                        ? [
                              { label: 'Admin Name', value: deleteModal.admin.name },
                              { label: 'Email', value: deleteModal.admin.email },
                              { label: 'Assigned Role', value: roleName(deleteModal.admin) },
                          ]
                        : []
                }
                confirmText="Revoke Access"
                variant="danger"
            />
        </div>
    );
}
