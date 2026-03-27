'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import StatusBadge from '../StatusBadge';
import { ADMIN_USERS } from '@/app/lib/data';
import { formatDate, formatDateTime } from '@/app/lib/utils';
import { Search, Edit2, Trash2, Key, LogOut, Plus } from 'lucide-react';
import type { AdminUser, AdminArea, UserStatus } from '@/app/lib/types';
import { toast } from 'sonner';
import Modal from '../Modal';

interface Props {
    product: 'inventory' | 'studio' | 'admin';
}

export default function UsersPageContent({ product }: Props) {
    const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterArea, setFilterArea] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Admin', area: 'Inventory' as AdminArea, status: 'Active' as UserStatus });

    const accentColor = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    const lightBg = product === 'studio' ? '#f0ebff' : '#eaf4e3';

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'All' || u.role === filterRole;
        const matchArea = filterArea === 'All' || u.area === filterArea;
        return matchSearch && matchRole && matchArea;
    });

    const roleColor: Record<string, string> = { SuperAdmin: '#92400e', Admin: '#1d4ed8', Analyst: '#7c3aed', Support: '#166534', Viewer: '#374151' };
    const roleBg: Record<string, string> = { SuperAdmin: '#fef3c7', Admin: '#dbeafe', Analyst: '#f3e8ff', Support: '#dcfce7', Viewer: '#f3f4f6' };

    const handleOpenModal = (user?: AdminUser) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, role: user.role, area: user.area, status: user.status });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'Admin', area: 'Inventory', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleSaveUser = () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and Email are required');
            return;
        }
        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
            toast.success('User updated successfully');
        } else {
            const newUser: AdminUser = {
                id: `u${Date.now()}`,
                ...formData,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };
            setUsers(prev => [newUser, ...prev]);
            toast.success('Admin invited successfully');
        }
        setIsModalOpen(false);
    };

    const handleDeleteUser = (id: string) => {
        if (confirm('Are you sure you want to remove this admin?')) {
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success('Admin removed');
        }
    };

    const handleResetPassword = (name: string) => {
        toast.success(`Password reset link sent to ${name}`);
    };

    const handleForceLogout = (name: string) => {
        toast.info(`Forced logout for ${name}`);
    };

    return (
        <div>
            <Topbar title="Admin Users" subtitle="Manage admin access and roles" product={product} />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Total Users', value: users.length, color: accentColor },
                        { label: 'Active', value: users.filter(u => u.status === 'Active').length, color: '#22c55e' },
                        { label: 'Suspended', value: users.filter(u => u.status === 'Suspended').length, color: '#f97316' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid #f0f0f0`, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {/* Filters */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ paddingLeft: 32, width: '100%', height: 36, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#1a1a2e', outline: 'none' }} />
                        </div>
                        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ height: 36, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 13, background: '#f9fafb', color: '#374151', outline: 'none' }}>
                            <option>All</option>
                            {['SuperAdmin', 'Admin', 'Analyst', 'Support', 'Viewer'].map(r => <option key={r}>{r}</option>)}
                        </select>
                        <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ height: 36, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 13, background: '#f9fafb', color: '#374151', outline: 'none' }}>
                            <option>All</option>
                            {['Inventory', 'Studio', 'Both'].map(a => <option key={a}>{a}</option>)}
                        </select>
                        <button
                            onClick={() => handleOpenModal()}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, background: accentColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            <Plus size={14} /> Invite Admin
                        </button>
                    </div>
                    {/* Table */}
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ minWidth: 1000 }}>
                            <thead>
                                <tr>
                                    {['Name', 'Email', 'Role', 'Area Access', 'Status', 'Last Login', 'Created', 'Actions'].map(h => (
                                        <th key={h} style={{ textAlign: h === 'Actions' ? 'center' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => (
                                    <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = lightBg)}
                                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${roleColor[u.role] || '#6b7280'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: roleColor[u.role] || '#6b7280', flexShrink: 0 }}>
                                                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                                        <td>
                                            <span style={{ padding: '3px 10px', background: roleBg[u.role] || '#f3f4f6', color: roleColor[u.role] || '#374151', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                                        </td>
                                        <td style={{ fontSize: 12 }}>
                                            <span style={{ padding: '3px 10px', background: u.area === 'Both' ? '#f0ebff' : u.area === 'Inventory' ? '#eaf4e3' : '#eff6ff', color: u.area === 'Both' ? '#7c5cbf' : u.area === 'Inventory' ? '#5b8441' : '#1d4ed8', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{u.area}</span>
                                        </td>
                                        <td><StatusBadge status={u.status} size="sm" /></td>
                                        <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDateTime(u.lastLogin)}</td>
                                        <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(u.createdAt)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleOpenModal(u)}
                                                    title="Edit Role" style={{ background: lightBg, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: accentColor }}><Edit2 size={13} /></button>
                                                <button
                                                    onClick={() => handleResetPassword(u.name)}
                                                    title="Reset Password" style={{ background: '#f0f9ff', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#0284c7' }}><Key size={13} /></button>
                                                <button
                                                    onClick={() => handleForceLogout(u.name)}
                                                    title="Force Logout" style={{ background: '#fff7ed', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#ea580c' }}><LogOut size={13} /></button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    title="Remove Access" style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626' }}><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af' }}>
                        Showing {filtered.length} of {users.length} users
                    </div>
                </div>
            </div>

            {/* Invite/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit Admin User' : 'Invite New Admin'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveUser} style={{ padding: '10px 24px', background: accentColor, border: 'none', borderRadius: 10, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: `0 2px 8px ${accentColor}4d` }}>
                            {editingUser ? 'Save Changes' : 'Send Invitation'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. John Doe"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                        <input
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                            >
                                {['SuperAdmin', 'Admin', 'Analyst', 'Support', 'Viewer'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Area Access</label>
                            <select
                                value={formData.area}
                                onChange={e => setFormData(prev => ({ ...prev, area: e.target.value as AdminArea }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                            >
                                {['Inventory', 'Studio', 'Both'].map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as UserStatus }))}
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                        >
                            {['Active', 'Suspended', 'Inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
