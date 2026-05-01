'use client';
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useCreateReferralTier, useUpdateReferralTier } from '@/api/inventory';
import { ReferralTier } from '@/api/inventory/inventory.types';
import { toast } from 'sonner';

interface ReferralTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier?: ReferralTier | null;
}

export default function ReferralTierModal({ isOpen, onClose, tier }: ReferralTierModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    min_points: 0,
    max_points: undefined as number | undefined,
    color: '#000000',
    order: 0,
  });

  const createMutation = useCreateReferralTier();
  const updateMutation = useUpdateReferralTier();

  useEffect(() => {
    if (tier) {
      setFormData({
        name: tier.name || '',
        slug: tier.slug || '',
        min_points: tier.min_points || 0,
        max_points: tier.max_points,
        color: tier.color || '#000000',
        order: tier.order || 0,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        min_points: 0,
        max_points: undefined,
        color: '#000000',
        order: 0,
      });
    }
  }, [tier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tier) {
        await updateMutation.mutateAsync({
          id: tier.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      // toast handled in mutation
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    marginBottom: 12,
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 4,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tier ? 'Edit Referral Tier' : 'Add New Referral Tier'} maxWidth={500}>
      <form onSubmit={handleSubmit}>
        <div>
          <label style={labelStyle}>Tier Name</label>
          <input
            style={inputStyle}
            placeholder="e.g. Gold"
            value={formData.name}
            onChange={(e) => {
                const val = e.target.value;
                setFormData({ 
                    ...formData, 
                    name: val,
                    slug: tier ? formData.slug : val.toLowerCase().replace(/\s+/g, '-')
                });
            }}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Slug</label>
          <input
            style={inputStyle}
            placeholder="e.g. gold-tier"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div>
            <label style={labelStyle}>Min Points</label>
            <input
              style={inputStyle}
              type="number"
              value={formData.min_points}
              onChange={(e) => setFormData({ ...formData, min_points: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Max Points (Optional)</label>
            <input
              style={inputStyle}
              type="number"
              value={formData.max_points || ''}
              onChange={(e) => setFormData({ ...formData, max_points: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div>
            <label style={labelStyle}>Theme Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    style={{ ...inputStyle, width: '30%', padding: 4, height: 40 }}
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <input
                    style={{ ...inputStyle, flex: 1 }}
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Display Order</label>
            <input
              style={inputStyle}
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6c9e4e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (tier ? 'Update Tier' : 'Create Tier')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
