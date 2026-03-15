'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Building, MoreVertical } from 'lucide-react';
import { useInventoryIntegrations } from '@/api/inventory/inventory.queries';

export default function BusinessIntegrationsPageClient() {
    const { data: integrations, isLoading } = useInventoryIntegrations();

    return (
        <div>
            <Topbar title="Business Integrations" subtitle="Manage integrations with partner businesses and B2B workflows." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Business Integrations</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your business integrations.</p>
                        </div>
                    </div>
                    <button style={{
                        background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                        padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                    }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search business integrations..."
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
                                <th>Partner Name</th>
                                <th>Category</th>
                                <th>Active Users</th>
                                <th>Last Sync</th>
                                <th>Status</th>
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : integrations?.map((int) => (
                                <tr key={int.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{int.name}</td>
                                    <td>{int.category}</td>
                                    <td>{int.activeUsers.toLocaleString()}</td>
                                    <td>{new Date(int.lastSync).toLocaleString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: int.status === 'Active' ? '#eaf4e3' : '#fef2f2',
                                            color: int.status === 'Active' ? '#6c9e4e' : '#ef4444'
                                        }}>
                                            {int.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
