'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Send, Eye, Copy, MessageSquare, Users, Image as ImageIcon } from 'lucide-react';
import { useInventoryBroadcasts } from '@/api/inventory/inventory.queries';
import { Broadcast } from '@/api/inventory/inventory.types';
import { formatDateTime } from '@/app/lib/utils';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function SendBroadcastPageClient() {
    const { data: response, isLoading } = useInventoryBroadcasts();
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        channel: 'WhatsApp',
        message: '',
        recipientsCount: 0,
        segment: 'All Customers'
    });

    useEffect(() => {
        if (response?.data) {
            setBroadcasts(response.data);
        }
    }, [response]);

    const handleOpenModal = () => {
        setFormData({
            title: '',
            channel: 'WhatsApp',
            message: '',
            recipientsCount: Math.floor(Math.random() * 500) + 50,
            segment: 'All Customers'
        });
        setIsModalOpen(true);
    };

    const handleSendBroadcast = () => {
        if (!formData.title || !formData.message) {
            toast.error('Title and message are required');
            return;
        }

        const newBroadcast: Broadcast = {
            id: `bc-${Date.now()}`,
            title: formData.title,
            channel: formData.channel,
            recipients: formData.recipientsCount,
            sentAt: new Date().toISOString(),
            status: 'Sent',
            deliveryRate: '100%',
            readRate: '0%'
        };

        setBroadcasts(prev => [newBroadcast, ...prev]);
        toast.success(`Broadcast "${formData.title}" sent successfully to ${formData.recipientsCount} recipients`);
        setIsModalOpen(false);
    };

    const handleAction = (type: 'view' | 'duplicate', b: Broadcast) => {
        if (type === 'duplicate') {
            const duplicated: Broadcast = {
                ...b,
                id: `bc-dup-${Date.now()}`,
                title: `${b.title} (Copy)`,
                sentAt: new Date().toISOString(),
                status: 'Draft' as any,
                readRate: '0%'
            };
            setBroadcasts(prev => [duplicated, ...prev]);
            toast.success(`Broadcast "${b.title}" duplicated as draft`);
        } else {
            toast.info(`Opening details for broadcast: ${b.title}`);
        }
    };

    const filtered = broadcasts.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.channel.toLowerCase().includes(search.toLowerCase())
    );

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
                    <button
                        onClick={handleOpenModal}
                        style={{
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
                            value={search}
                            onChange={e => setSearch(e.target.value)}
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
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && broadcasts.length === 0 ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No broadcasts found</td>
                                </tr>
                            ) : filtered.map((b: Broadcast) => (
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
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleAction('view', b)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="View">
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAction('duplicate', b)}
                                                style={{ background: '#f3f4f6', border: 'none', color: '#374151', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Duplicate">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Compose New Broadcast"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSendBroadcast} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            <Send size={14} style={{ marginRight: 6 }} /> Send Broadcast
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Broadcast Title
                        </label>
                        <input
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Monthly Newsletter - March"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Channel</label>
                            <select
                                value={formData.channel}
                                onChange={e => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['WhatsApp', 'Email', 'SMS'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Recipient Segment</label>
                            <select
                                value={formData.segment}
                                onChange={e => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['All Customers', 'Trial Users', 'Active Subscribers', 'Expired'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <MessageSquare size={14} /> Message Content
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Type your message here..."
                            style={{ height: 120, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                            <Users size={16} />
                            <span>Estimated <b>{formData.recipientsCount}</b> recipients</span>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#6c9e4e', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ImageIcon size={14} /> Add Media
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
