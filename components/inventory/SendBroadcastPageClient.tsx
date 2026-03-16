'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Send, MoreVertical } from 'lucide-react';
import { useInventoryBroadcasts } from '@/api/inventory/inventory.queries';
import { Broadcast } from '@/api/inventory/inventory.types';
import { formatDateTime } from '@/app/lib/utils';

export default function SendBroadcastPageClient() {
    const { data: response, isLoading } = useInventoryBroadcasts();
    const broadcasts = response?.data || [];

    return (
        <div>
            <Topbar title="Send Broadcast" subtitle="Compose and send bulk messages to segmented audiences." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Send Broadcast</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and send broadcasts to your users.</p>
                        </div>
                    </div>
                    <button style={{
                        background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                        padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                    }}>
                        <Plus size={18} /> New Broadcast
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search broadcasts..."
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
                                <th>Broadcast Title</th>
                                <th>Target Channel</th>
                                <th>Recipients</th>
                                <th>Sent At</th>
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
                            ) : broadcasts.map((b: Broadcast) => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{b.title}</td>
                                    <td>{b.channel}</td>
                                    <td>{b.recipients.toLocaleString()}</td>
                                    <td>{formatDateTime(b.sentAt)}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                            background: b.status === 'Sent' ? '#dcfce7' : '#f3f4f6',
                                            color: b.status === 'Sent' ? '#15803d' : '#6b7280'
                                        }}>
                                            {b.status}
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
