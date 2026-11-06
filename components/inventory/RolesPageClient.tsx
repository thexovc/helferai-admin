'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Users, Edit2, Trash2, ShieldCheck, Key } from 'lucide-react';
import { useInventoryRoles } from '@/api/inventory/inventory.queries';
import { useCreateRole, useUpdateRole, useDeleteRole } from '@/api/inventory/inventory.mutations';
import { AdminRoleRecord } from '@/api/inventory/inventory.types';
import { inventoryNav } from '../Sidebar';
import { pageKeyOf } from '@/api/auth/useMyAccess';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

// A role's permissions are the admin pages it can open, grouped like the sidebar
const PAGE_GROUPS = inventoryNav.map(g => ({ title: g.title || 'Overview', pages: g.items.map(i => ({ key: pageKeyOf(i.href), label: i.label })) }));
const PAGE_LABEL: Record<string, string> = Object.fromEntries(PAGE_GROUPS.flatMap(g => g.pages.map(p => [p.key, p.label])));

export default function RolesPageClient({ embedded = false }: { embedded?: boolean }) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState('');

    const { data: rolesResponse, isLoading } = useInventoryRoles(page, pageSize, search);

    const createMutation = useCreateRole();
    const updateMutation = useUpdateRole();
    const deleteMutation = useDeleteRole();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<AdminRoleRecord | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
    });

    const handleOpenModal = (role?: AdminRoleRecord) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name || '',
                description: role.description || '',
                // Keep only page permissions; older roles saved merchant-app names
                permissions: (role.permissions || []).filter(p => PAGE_LABEL[p])
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
                permissions: ['dashboard']
            });
        }
        setIsModalOpen(true);
    };

    const handleTogglePermission = (p: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(p)
                ? prev.permissions.filter(x => x !== p)
                : [...prev.permissions, p]
        }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error('Role name is required');
            return;
        }

        try {
            if (editingRole) {
                await updateMutation.mutateAsync({
                    id: editingRole.id,
                    dto: formData
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsModalOpen(false);
        } catch (err) { }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; role: AdminRoleRecord | null }>({
        isOpen: false,
        role: null,
    });

    const handleDelete = (role: AdminRoleRecord) => {
        setDeleteModal({ isOpen: true, role });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.role) return;
        try {
            await deleteMutation.mutateAsync(deleteModal.role.id);
            setDeleteModal({ isOpen: false, role: null });
        } catch (err) { }
    };

    const rawRoles = rolesResponse?.data || [];
    // Sort latest first
    const roles = [...rawRoles].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = rolesResponse?.meta?.total || roles.length;

    return (
        <div>
            {!embedded && <Topbar title="Roles & Permissions" subtitle="Define RBAC roles and granular permission sets." product="inventory" />}

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Administrative Roles</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Configure access permissions across admin modules.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> Create Role
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search roles..."
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
                                <th>Role Name</th>
                                <th>Description</th>
                                <th>Assigned Admins</th>
                                <th>Pages</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={5}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No roles found</td>
                                </tr>
                            ) : roles.map((role: AdminRoleRecord) => (
                                <tr key={role.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 700, color: '#1a1a2e' }}>{role.name}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{role.description || 'Custom administrative role'}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#f3f4f6', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                                            <Users size={12} /> {(role as any).userCount ?? role.adminCount ?? 0} admins
                                        </span>
                                    </td>
                                    <td>
                                        {(role as any).isSuperAdmin ? <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>All pages (Super Admin)</span> :
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 400 }}>
                                            {(role.permissions || []).filter(p => PAGE_LABEL[p]).length === 0 && <span style={{ fontSize: 12, color: '#b91c1c' }}>No pages yet</span>}
                                            {(role.permissions || []).filter(p => PAGE_LABEL[p]).slice(0, 4).map(p => (
                                                <span key={p} style={{ padding: '2px 6px', background: '#eaf4e3', color: '#5b8441', borderRadius: 4, fontSize: 11 }}>
                                                    {PAGE_LABEL[p]}
                                                </span>
                                            ))}
                                            {(role.permissions || []).filter(p => PAGE_LABEL[p]).length > 4 && (
                                                <span style={{ padding: '2px 6px', background: '#f3f4f6', color: '#6b7280', borderRadius: 4, fontSize: 10 }}>
                                                    +{(role.permissions || []).filter(p => PAGE_LABEL[p]).length - 4} more
                                                </span>
                                            )}
                                        </div>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(role)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role)}
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
                title={editingRole ? 'Edit Role' : 'Create Role'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Finance Auditor"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what users with this role can do..."
                            style={{ height: 60, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                            <Key size={14} /> Pages this role can open
                        </label>
                        {(editingRole as any)?.isSuperAdmin && <div style={{ fontSize: 12, color: '#92400e', marginBottom: 8 }}>Super Admin always has every page.</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto', padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                            {PAGE_GROUPS.map(g => {
                                const keys = g.pages.map(p => p.key);
                                const all = keys.every(k => formData.permissions.includes(k));
                                return (
                                    <div key={g.title}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={all} style={{ accentColor: '#6c9e4e' }}
                                                onChange={() => setFormData(prev => ({ ...prev, permissions: all ? prev.permissions.filter(k => !keys.includes(k)) : Array.from(new Set([...prev.permissions, ...keys])) }))} />
                                            {g.title}
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, paddingLeft: 22 }}>
                                            {g.pages.map(p => (
                                                <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={formData.permissions.includes(p.key)} onChange={() => handleTogglePermission(p.key)} style={{ accentColor: '#6c9e4e', cursor: 'pointer' }} />
                                                    {p.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Role Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, role: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                title="Delete Admin Role"
                description={`Are you sure you want to delete the role "${deleteModal.role?.name}"? Admins currently assigned this role will lose their granted permissions.`}
                details={
                    deleteModal.role
                        ? [
                              { label: 'Role Name', value: deleteModal.role.name },
                              { label: 'Description', value: deleteModal.role.description || 'No description' },
                              { label: 'Permissions Count', value: `${deleteModal.role.permissions?.length || 0} permissions` },
                              { label: 'Assigned Admins', value: `${(deleteModal.role as any).userCount ?? 0} admins` },
                          ]
                        : []
                }
                confirmText="Delete Role"
                variant="danger"
            />
        </div>
    );
}
