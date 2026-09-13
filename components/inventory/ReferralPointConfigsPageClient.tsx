'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Settings, Edit2, Trash2 } from 'lucide-react';
import { useInventoryPointConfigs } from '@/api/inventory/inventory.queries';
import { useCreatePointConfig, useUpdatePointConfig, useDeletePointConfig } from '@/api/inventory/inventory.mutations';
import { PointConfig } from '@/api/inventory/inventory.types';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function ReferralPointConfigsPageClient() {
    const { data: configsResponse, isLoading } = useInventoryPointConfigs();
    const configs = (configsResponse as any)?.data || (Array.isArray(configsResponse) ? configsResponse : []);
    const [search, setSearch] = useState('');

    const createMutation = useCreatePointConfig();
    const updateMutation = useUpdatePointConfig();
    const deleteMutation = useDeletePointConfig();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<PointConfig | null>(null);
    const [formData, setFormData] = useState({
        activity_type: '',
        user_points: 100,
        referrer_points: 200,
        description: '',
        is_active: true
    });

    const handleOpenModal = (cfg?: PointConfig) => {
        if (cfg) {
            setEditingConfig(cfg);
            setFormData({
                activity_type: cfg.activity_type || cfg.action || '',
                user_points: cfg.user_points || cfg.points || 0,
                referrer_points: cfg.referrer_points || 0,
                description: cfg.description || '',
                is_active: cfg.status === 'Active'
            });
        } else {
            setEditingConfig(null);
            setFormData({
                activity_type: '',
                user_points: 100,
                referrer_points: 200,
                description: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.activity_type) {
            toast.error('Activity type is required');
            return;
        }

        try {
            if (editingConfig) {
                await updateMutation.mutateAsync({
                    id: editingConfig.id,
                    dto: formData
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsModalOpen(false);
        } catch (err) { }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; cfg: PointConfig | null }>({
        isOpen: false,
        cfg: null,
    });

    const handleDelete = (cfg: PointConfig) => {
        setDeleteModal({ isOpen: true, cfg });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.cfg) return;
        try {
            await deleteMutation.mutateAsync(deleteModal.cfg.id);
            setDeleteModal({ isOpen: false, cfg: null });
        } catch (err) { }
    };

    const filtered = configs.filter((c: PointConfig) =>
        (c.activity_type || c.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Referral Point Configs" subtitle="Configure point rules and distribution for platform actions." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Point Configurations</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Configure user and referrer point allocations.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> Add Point Rule
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search point configs..."
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
                                <th>Activity Type</th>
                                <th>Referred Points</th>
                                <th>Referrer Points</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No configurations found</td>
                                </tr>
                            ) : filtered.map((config: PointConfig) => (
                                <tr key={config.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e', fontFamily: 'monospace' }}>{config.activity_type || config.action}</td>
                                    <td><span style={{ fontWeight: 700, color: '#16a34a' }}>+{config.user_points || config.points || 0} pts</span></td>
                                    <td><span style={{ fontWeight: 700, color: '#2563eb' }}>+{config.referrer_points || 0} pts</span></td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{config.description || 'Standard reward rule'}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: config.status === 'Active' ? '#eaf4e3' : '#fef2f2',
                                            color: config.status === 'Active' ? '#6c9e4e' : '#ef4444'
                                        }}>
                                            {config.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(config)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(config)}
                                                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete">
                                                <Trash2 size={14} />
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
                title={editingConfig ? 'Edit Point Configuration' : 'Add New Point Rule'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingConfig ? 'Save Changes' : 'Create Rule'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Activity Type Key</label>
                        <input
                            value={formData.activity_type}
                            onChange={e => setFormData(prev => ({ ...prev, activity_type: e.target.value }))}
                            placeholder="e.g. signup_referral, first_sale"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Points to Referred User</label>
                            <input
                                type="number"
                                value={formData.user_points}
                                onChange={e => setFormData(prev => ({ ...prev, user_points: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Points to Referrer</label>
                            <input
                                type="number"
                                value={formData.referrer_points}
                                onChange={e => setFormData(prev => ({ ...prev, referrer_points: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Rule explanation..."
                            style={{ height: 80, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Point Config Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, cfg: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                title="Delete Point Rule"
                description={`Are you sure you want to delete the point allocation rule for "${deleteModal.cfg?.activity_type || deleteModal.cfg?.action}"?`}
                details={
                    deleteModal.cfg
                        ? [
                              { label: 'Activity Type', value: deleteModal.cfg.activity_type || deleteModal.cfg.action },
                              { label: 'Referred User Points', value: `+${deleteModal.cfg.user_points ?? deleteModal.cfg.points ?? 0} pts` },
                              { label: 'Referrer Points', value: `+${deleteModal.cfg.referrer_points ?? 0} pts` },
                          ]
                        : []
                }
                confirmText="Delete Rule"
                variant="danger"
            />
        </div>
    );
}
