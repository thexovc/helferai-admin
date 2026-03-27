'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { ROLES, PERMISSIONS } from '@/app/lib/data';
import { Check, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../Modal';
import type { Role } from '@/app/lib/types';

interface Props {
    product: 'inventory' | 'studio' | 'admin';
}

export default function AdminsPageContent({ product }: Props) {
    const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
    const [roles, setRoles] = useState(ROLES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] });

    const accentColor = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    const lightBg = product === 'studio' ? '#f0ebff' : '#eaf4e3';

    const tabStyle = (t: string) => ({
        padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
        background: activeTab === t ? accentColor : 'transparent',
        color: activeTab === t ? '#fff' : '#6b7280',
        transition: 'all 0.2s',
    } as React.CSSProperties);

    const handleOpenModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setFormData({ name: role.name, description: role.description, permissions: [...role.permissions] });
        } else {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleSaveRole = () => {
        if (!formData.name) {
            toast.error('Role name is required');
            return;
        }
        if (editingRole) {
            setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...formData as any } : r));
            toast.success('Role updated successfully');
        } else {
            const newRole: Role = {
                id: `r${Date.now()}`,
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
                userCount: 0,
            };
            setRoles(prev => [...prev, newRole]);
            toast.success('Role created successfully');
        }
        setIsModalOpen(false);
    };

    const handleDeleteRole = (id: string) => {
        if (confirm('Are you sure you want to delete this role?')) {
            setRoles(prev => prev.filter(r => r.id !== id));
            toast.success('Role deleted');
        }
    };

    const togglePermission = (id: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(id)
                ? prev.permissions.filter(p => p !== id)
                : [...prev.permissions, id]
        }));
    };

    return (
        <div>
            <Topbar title="Admins & RBAC" subtitle="Manage roles and permissions" product={product} />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
                        <button style={tabStyle('roles')} onClick={() => setActiveTab('roles')}>Roles</button>
                        <button style={tabStyle('permissions')} onClick={() => setActiveTab('permissions')}>Permission Matrix</button>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: accentColor, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 2px 8px ${accentColor}4d` }}>
                        <Plus size={15} /> Create Role
                    </button>
                </div>

                {activeTab === 'roles' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {roles.map(role => {
                            const roleColors: Record<string, { bg: string; color: string }> = {
                                SuperAdmin: { bg: '#fef3c7', color: '#92400e' },
                                Admin: { bg: '#dbeafe', color: '#1d4ed8' },
                                Analyst: { bg: '#f3e8ff', color: '#7c3aed' },
                                Support: { bg: '#dcfce7', color: '#166534' },
                                Viewer: { bg: '#f3f4f6', color: '#374151' },
                            };
                            const { bg, color } = roleColors[role.name] || { bg: '#f3f4f6', color: '#374151' };
                            return (
                                <div key={role.id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', transition: 'box-shadow 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div>
                                            <span style={{ padding: '4px 12px', background: bg, color, borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{role.name}</span>
                                            <p style={{ fontSize: 13, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5 }}>{role.description}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button
                                                onClick={() => handleOpenModal(role)}
                                                style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#6b7280' }}><Edit2 size={13} /></button>
                                            <button
                                                onClick={() => handleDeleteRole(role.id)}
                                                style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626' }}><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                    {/* Permissions */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                                        {role.permissions.slice(0, 5).map(pid => {
                                            const perm = PERMISSIONS.find(p => p.id === pid);
                                            return perm ? (
                                                <span key={pid} style={{ padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', fontSize: 11, fontWeight: 500, borderRadius: 6 }}>{perm.label}</span>
                                            ) : null;
                                        })}
                                        {role.permissions.length > 5 && <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center' }}>+{role.permissions.length - 5} more</span>}
                                    </div>
                                    {/* User count */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', borderTop: '1px solid #f5f5f5', paddingTop: 12 }}>
                                        <Users size={13} /> {role.userCount} users assigned
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Permission Matrix */
                    <div className="table-container">
                        <table style={{ minWidth: 600 }}>
                            <thead>
                                <tr>
                                    <th>Permission</th>
                                    {roles.map(r => (
                                        <th key={r.id} style={{ textAlign: 'center' }}>{r.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSIONS.map((perm, i) => (
                                    <tr key={perm.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{perm.label}</td>
                                        {roles.map(role => {
                                            const has = role.permissions.includes(perm.id);
                                            return (
                                                <td key={role.id}>
                                                    {has
                                                        ? <div style={{ width: 22, height: 22, borderRadius: 6, background: lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><Check size={13} color={accentColor} /></div>
                                                        : <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f3f4f6', margin: '0 auto' }} />}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Role Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRole ? 'Edit Role' : 'Create New Role'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveRole} style={{ padding: '10px 24px', background: accentColor, border: 'none', borderRadius: 10, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: `0 2px 8px ${accentColor}4d` }}>
                            {editingRole ? 'Save Changes' : 'Create Role'}
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
                            placeholder="e.g. Content Manager"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Briefly describe the responsibilities..."
                            style={{ height: 80, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Permissions</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {PERMISSIONS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => togglePermission(p.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1.5px solid',
                                        borderColor: formData.permissions.includes(p.id) ? accentColor : '#e5e7eb',
                                        background: formData.permissions.includes(p.id) ? lightBg : '#fff',
                                        color: formData.permissions.includes(p.id) ? accentColor : '#6b7280',
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid', borderColor: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', background: formData.permissions.includes(p.id) ? accentColor : 'transparent' }}>
                                        {formData.permissions.includes(p.id) && <Check size={10} color="#fff" strokeWidth={4} />}
                                    </div>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
