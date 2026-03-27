'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Phone, Edit2, Trash2, Building2 } from 'lucide-react';
import { useInventoryWhatsappNumbers } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function WhatsAppNumbersPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: numbersResponse, isLoading } = useInventoryWhatsappNumbers(page, pageSize);
    const [numbers, setNumbers] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNumber, setEditingNumber] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        number: '',
        businessName: '',
        status: 'Active',
    });

    useEffect(() => {
        if (numbersResponse?.data) {
            setNumbers(numbersResponse.data);
        }
    }, [numbersResponse]);

    const handleOpenModal = (num?: any) => {
        if (num) {
            setEditingNumber(num);
            setFormData({
                number: num.number,
                businessName: num.businessName,
                status: num.status,
            });
        } else {
            setEditingNumber(null);
            setFormData({
                number: '',
                businessName: '',
                status: 'Active',
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveNumber = () => {
        if (!formData.number || !formData.businessName) {
            toast.error('Phone number and business name are required');
            return;
        }

        if (editingNumber) {
            setNumbers(prev => prev.map(n => n.id === editingNumber.id ? { ...n, ...formData, lastActive: new Date().toISOString() } : n));
            toast.success(`WhatsApp number "${formData.number}" updated successfully`);
        } else {
            const newNum = {
                id: `num-${Date.now()}`,
                ...formData,
                lastActive: new Date().toISOString()
            };
            setNumbers(prev => [newNum, ...prev]);
            toast.success(`WhatsApp number "${formData.number}" connected successfully`);
        }
        setIsModalOpen(false);
    };

    const handleDeleteNumber = (num: any) => {
        if (confirm(`Are you sure you want to disconnect and delete ${num.number}? This action cannot be undone.`)) {
            setNumbers(prev => prev.filter(item => item.id !== num.id));
            toast.success(`WhatsApp number ${num.number} disconnected successfully`);
        }
    };

    const filtered = numbers.filter(n =>
        n.number.toLowerCase().includes(search.toLowerCase()) ||
        n.businessName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="WhatsApp Numbers" subtitle="Manage connected WhatsApp business numbers for communication." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>WhatsApp Numbers</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your whatsapp numbers.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
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
                            placeholder="Search whatsapp numbers..."
                            style={{
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Phone Number</th>
                                <th>Business Name</th>
                                <th>Status</th>
                                <th>Last Active</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && numbers.length === 0 ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={5}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No numbers found</td>
                                </tr>
                            ) : filtered.map((n) => (
                                <tr key={n.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{n.number}</td>
                                    <td>{n.businessName}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: n.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                            color: n.status === 'Active' ? '#166534' : '#991b1b'
                                        }}>
                                            {n.status}
                                        </span>
                                    </td>
                                    <td>{new Date(n.lastActive).toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(n)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNumber(n)}
                                                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete/Disconnect">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil((numbersResponse?.meta?.total || numbers.length) / pageSize)}
                            onPageChange={setPage}
                            totalItems={numbersResponse?.meta?.total || numbers.length}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingNumber ? 'Edit WhatsApp Number' : 'Connect New Number'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveNumber} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {editingNumber ? 'Save Changes' : 'Connect Number'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Phone size={14} /> Phone Number
                        </label>
                        <input
                            value={formData.number}
                            onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                            placeholder="e.g. +234 812 345 6789"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Business Name
                        </label>
                        <input
                            value={formData.businessName}
                            onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="e.g. Acme Corp"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                            {['Active', 'Inactive', 'Disconnected'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
