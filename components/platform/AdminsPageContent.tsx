'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { ROLES, PERMISSIONS } from '@/app/lib/data';
import { Check, Plus, Edit2, Trash2, Users } from 'lucide-react';

interface Props {
    product: 'inventory' | 'studio' | 'admin';
}

export default function AdminsPageContent({ product }: Props) {
    const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
    const [roles, setRoles] = useState(ROLES);

    const accentColor = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    const lightBg = product === 'studio' ? '#f0ebff' : '#eaf4e3';

    const tabStyle = (t: string) => ({
        padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
        background: activeTab === t ? accentColor : 'transparent',
        color: activeTab === t ? '#fff' : '#6b7280',
        transition: 'all 0.2s',
    } as React.CSSProperties);

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
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: accentColor, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 2px 8px ${accentColor}4d` }}>
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
                                            <button style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#6b7280' }}><Edit2 size={13} /></button>
                                            <button style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#dc2626' }}><Trash2 size={13} /></button>
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
        </div>
    );
}
