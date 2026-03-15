'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Search, Puzzle, MoreVertical } from 'lucide-react';
import { useInventoryIntegrations } from '@/api/inventory';
import { formatDateTime } from '@/app/lib/utils';


export default function IntegrationsPageClient() {
    const { data: integrations, isLoading } = useInventoryIntegrations();
    const [search, setSearch] = React.useState('');

    const filtered = (integrations || []).filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.provider.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Integrations" subtitle="Manage external software integrations (e.g., ERP, Accounting)" product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Puzzle size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Integrations</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your third-party integrations.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search integrations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                                <th>Integration Name</th>
                                <th>Provider</th>
                                <th>Auth Status</th>
                                <th>Last Sync</th>
                                <th>Status</th>
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        <td colSpan={6}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No integrations found</td>
                                </tr>
                            ) : (
                                filtered.map((i: any) => (
                                    <tr key={i.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{i.name}</td>
                                        <td style={{ color: '#374151' }}>{i.provider}</td>
                                        <td>
                                            <span style={{
                                                fontSize: 12,
                                                color: i.authStatus === 'Connected' ? '#16a34a' : '#dc2626',
                                                display: 'flex', alignItems: 'center', gap: 4
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: i.authStatus === 'Connected' ? '#16a34a' : '#dc2626' }}></span>
                                                {i.authStatus}
                                            </span>
                                        </td>
                                        <td style={{ color: '#6b7280', fontSize: 12 }}>{formatDateTime(i.lastSync)}</td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px',
                                                background: i.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                                                color: i.status === 'Active' ? '#15803d' : '#6b7280',
                                                borderRadius: 99, fontSize: 11, fontWeight: 700
                                            }}>
                                                {i.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>


                    {/* Pagination Footer */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Showing 1 to 5 of 24 entries</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: '#9ca3af', cursor: 'pointer' }} disabled>Previous</button>
                            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: '#1a1a2e', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
