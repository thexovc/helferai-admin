'use client';
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useCreatePointConfig, useUpdatePointConfig } from '@/api/inventory';
import { PointConfig } from '@/api/inventory/inventory.types';
import { toast } from 'sonner';

interface PointConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: PointConfig | null;
}

export default function PointConfigModal({ isOpen, onClose, config }: PointConfigModalProps) {
  const [formData, setFormData] = useState({
    activity_type: '',
    user_points: 0,
    referrer_points: 0,
    description: '',
    is_active: true,
  });

  const createMutation = useCreatePointConfig();
  const updateMutation = useUpdatePointConfig();

  useEffect(() => {
    if (config) {
      setFormData({
        activity_type: config.activity_type || '',
        user_points: config.user_points || 0,
        referrer_points: config.referrer_points || 0,
        description: config.description || '',
        is_active: config.status === 'Active',
      });
    } else {
      setFormData({
        activity_type: '',
        user_points: 0,
        referrer_points: 0,
        description: '',
        is_active: true,
      });
    }
  }, [config, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (config) {
        await updateMutation.mutateAsync({
          id: config.id,
          data: { ...formData, status: undefined } as any, // backend handles status via is_active
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
    <Modal isOpen={isOpen} onClose={onClose} title={config ? 'Edit Point Configuration' : 'Add Point Configuration'} maxWidth={500}>
      <form onSubmit={handleSubmit}>
        <div>
          <label style={labelStyle}>Activity Type / Action (Slug)</label>
          <input
            style={inputStyle}
            placeholder="e.g. signup_referral"
            value={formData.activity_type}
            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
            required
            disabled={!!config} // Usually activity type shouldn't change as logic depends on it
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <input
            style={inputStyle}
            placeholder="What is this activity for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div>
            <label style={labelStyle}>Points for Referrer</label>
            <input
              style={inputStyle}
              type="number"
              value={formData.referrer_points}
              onChange={(e) => setFormData({ ...formData, referrer_points: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Points for Referred User</label>
            <input
              style={inputStyle}
              type="number"
              value={formData.user_points}
              onChange={(e) => setFormData({ ...formData, user_points: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: 16, height: 16 }}
            />
            Status: {formData.is_active ? 'Active' : 'Inactive'}
          </label>
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
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (config ? 'Update Config' : 'Create Config')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
