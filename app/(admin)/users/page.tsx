'use client';
import React, { useState } from 'react';
import Topbar from '../../../components/Topbar';
import StatusBadge from '../../../components/StatusBadge';
import { ADMIN_USERS } from '../../lib/data';
import { formatDate, formatDateTime } from '../../lib/utils';
import { Search, Edit2, Trash2, Key, LogOut, Plus, Filter } from 'lucide-react';
import type { AdminUser } from '../../lib/types';

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterArea, setFilterArea] = useState('All');

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'All' || u.role === filterRole;
        const matchArea = filterArea === 'All' || u.area === filterArea;
        return matchSearch && matchRole && matchArea;
    });

    const roleColor: Record<string, string> = { SuperAdmin: '#92400e', Admin: '#1d4ed8', Analyst: '#7c3aed', Support: '#166534', Viewer: '#374151' };
    const roleBg: Record<string, string> = { SuperAdmin: '#fef3c7', Admin: '#dbeafe', Analyst: '#f3e8ff', Support: '#dcfce7', Viewer: '#f3f4f6' };

    return (
        <div>
            <Topbar title="Admin Users" subtitle="Manage admin access and roles" product="admin" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
                    {[
                        { label: 'Total Users', value: users.length, color: '#6c9e4e' },
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
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
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
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f0f9f0')}
                                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${roleColor[u.role]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: roleColor[u.role], flexShrink: 0 }}>
                                                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                                        <td>
                                            <span style={{ padding: '3px 10px', background: roleBg[u.role], color: roleColor[u.role], borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                                        </td>
                                        <td style={{ fontSize: 12 }}>
                                            <span style={{ padding: '3px 10px', background: u.area === 'Both' ? '#f0ebff' : u.area === 'Inventory' ? '#eaf4e3' : '#eff6ff', color: u.area === 'Both' ? '#7c5cbf' : u.area === 'Inventory' ? '#5b8441' : '#1d4ed8', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{u.area}</span>
                                        </td>
                                        <td><StatusBadge status={u.status} size="sm" /></td>
                                        <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDateTime(u.lastLogin)}</td>
                                        <td style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(u.createdAt)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                <button title="Edit Role" style={{ background: '#f0f9f0', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#6c9e4e' }}><Edit2 size={13} /></button>
                                                <button title="Reset Password" style={{ background: '#f0f9ff', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#0284c7' }}><Key size={13} /></button>
                                                <button title="Force Logout" style={{ background: '#fff7ed', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#ea580c' }}><LogOut size={13} /></button>
                                                <button title="Remove Access" style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626' }}><Trash2 size={13} /></button>
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
        </div>
    );
}
