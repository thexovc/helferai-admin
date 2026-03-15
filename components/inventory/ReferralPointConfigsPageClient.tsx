'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Settings, MoreVertical } from 'lucide-react';
import { useInventoryPointConfigs } from '@/api/inventory/inventory.queries';

export default function ReferralPointConfigsPageClient() {
    const { data: configs, isLoading } = useInventoryPointConfigs();

    return (
        <div>
            <Topbar title="Referral Point Configs" subtitle="Configure point values and rules for referral actions." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referral Point Configs</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your referral point configs.</p>
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
                            placeholder="Search referral point configs..."
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
                                <th>Action</th>
                                <th>Points</th>
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
                                        <td style={{ textAlign: 'center' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : configs?.map((config) => (
                                <tr key={config.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{config.action}</td>
                                    <td>{config.points} pts</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: config.status === 'Active' ? '#eaf4e3' : '#fef2f2',
                                            color: config.status === 'Active' ? '#6c9e4e' : '#ef4444'
                                        }}>
                                            {config.status}
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
