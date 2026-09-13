'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Trophy, Edit2, Trash2 } from 'lucide-react';
import { useInventoryReferralTiers } from '@/api/inventory/inventory.queries';
import { useCreateReferralTier, useUpdateReferralTier, useDeleteReferralTier } from '@/api/inventory/inventory.mutations';
import { ReferralTier } from '@/api/inventory/inventory.types';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function ReferralTiersPageClient() {
    const { data: tiersResponse, isLoading } = useInventoryReferralTiers();
    const tiers = (tiersResponse as any)?.data || (Array.isArray(tiersResponse) ? tiersResponse : []);
    const [search, setSearch] = useState('');

    const createMutation = useCreateReferralTier();
    const updateMutation = useUpdateReferralTier();
    const deleteMutation = useDeleteReferralTier();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<ReferralTier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        min_points: 0,
        max_points: 500,
        color: '#6c9e4e',
        order: 1
    });

    const handleOpenModal = (tier?: ReferralTier) => {
        if (tier) {
            setEditingTier(tier);
            setFormData({
                name: tier.name || '',
                slug: tier.slug || tier.name.toLowerCase().replace(/\s+/g, '-'),
                min_points: tier.min_points || 0,
                max_points: tier.max_points || 500,
                color: tier.color || '#6c9e4e',
                order: tier.order || 1
            });
        } else {
            setEditingTier(null);
            setFormData({
                name: '',
                slug: '',
                min_points: 0,
                max_points: 500,
                color: '#6c9e4e',
                order: 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error('Tier name is required');
            return;
        }

        try {
            const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
            if (editingTier) {
                await updateMutation.mutateAsync({
                    id: editingTier.id,
                    dto: { ...formData, slug }
                });
            } else {
                await createMutation.mutateAsync({ ...formData, slug });
            }
            setIsModalOpen(false);
        } catch (err) { }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; tier: ReferralTier | null }>({
        isOpen: false,
        tier: null,
    });

    const handleDelete = (tier: ReferralTier) => {
        setDeleteModal({ isOpen: true, tier });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.tier) return;
        try {
            await deleteMutation.mutateAsync(deleteModal.tier.id);
            setDeleteModal({ isOpen: false, tier: null });
        } catch (err) { }
    };

    const filtered = tiers.filter((t: ReferralTier) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.slug || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Referral Tiers" subtitle="Manage tiered rewards and milestones for active referrers." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referral Tiers</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Configure qualification points and tiers.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> Add New Tier
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search referral tiers..."
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
                                <th>Tier Name</th>
                                <th>Slug</th>
                                <th>Min Points</th>
                                <th>Max Points</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={7}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No tiers found</td>
                                </tr>
                            ) : filtered.map((tier: ReferralTier) => (
                                <tr key={tier.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>
                                        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: tier.color || '#6c9e4e', marginRight: 8 }}></span>
                                        {tier.name}
                                    </td>
                                    <td style={{ color: '#6b7280', fontFamily: 'monospace' }}>{tier.slug || '—'}</td>
                                    <td style={{ fontWeight: 600 }}>{tier.min_points ?? 0} pts</td>
                                    <td>{tier.max_points ? `${tier.max_points} pts` : 'Unlimited'}</td>
                                    <td>#{tier.order ?? 1}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: tier.status === 'Active' ? '#eaf4e3' : '#fef2f2',
                                            color: tier.status === 'Active' ? '#6c9e4e' : '#ef4444'
                                        }}>
                                            {tier.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(tier)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tier)}
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
                title={editingTier ? 'Edit Referral Tier' : 'Add New Referral Tier'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTier ? 'Save Changes' : 'Create Tier'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tier Name</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Platinum"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Min Points</label>
                            <input
                                type="number"
                                value={formData.min_points}
                                onChange={e => setFormData(prev => ({ ...prev, min_points: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Max Points</label>
                            <input
                                type="number"
                                value={formData.max_points}
                                onChange={e => setFormData(prev => ({ ...prev, max_points: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Badge Color</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '4px', cursor: 'pointer' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Display Order</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={e => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Tier Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, tier: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                title="Delete Referral Tier"
                description={`Are you sure you want to delete the tier "${deleteModal.tier?.name}"? Users currently at this milestone will be adjusted.`}
                details={
                    deleteModal.tier
                        ? [
                              { label: 'Tier Name', value: deleteModal.tier.name },
                              { label: 'Points Range', value: `${deleteModal.tier.min_points ?? deleteModal.tier.minReferrals ?? 0} - ${deleteModal.tier.max_points ?? '∞'} pts` },
                              { label: 'Status', value: deleteModal.tier.status || 'Active' },
                          ]
                        : []
                }
                confirmText="Delete Tier"
                variant="danger"
            />
        </div>
    );
}
