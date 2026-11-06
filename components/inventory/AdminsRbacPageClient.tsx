'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import AdminsPageClient from './AdminsPageClient';
import RolesPageClient from './RolesPageClient';

// Admins & RBAC: the people who can sign in to this admin area, and their roles
export default function AdminsRbacPageClient() {
    const [tab, setTab] = useState<'admins' | 'roles'>('admins');
    const tabStyle = (t: string): React.CSSProperties => ({
        padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
        background: tab === t ? '#6c9e4e' : 'transparent', color: tab === t ? '#fff' : '#6b7280',
    });
    return (
        <div>
            <Topbar title="Admins & RBAC" subtitle="Who can sign in to this admin area, and their roles." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', paddingBottom: 0 }}>
                <div style={{ display: 'inline-flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
                    <button style={tabStyle('admins')} onClick={() => setTab('admins')}>Admin users</button>
                    <button style={tabStyle('roles')} onClick={() => setTab('roles')}>Roles</button>
                </div>
            </div>
            {tab === 'admins' ? <AdminsPageClient embedded /> : <RolesPageClient embedded />}
        </div>
    );
}
