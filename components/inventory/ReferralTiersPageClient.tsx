'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Trophy, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useInventoryReferralTiers } from '@/api/inventory/inventory.queries';
import { useDeleteReferralTier } from '@/api/inventory/inventory.mutations';
import { ReferralTier } from '@/api/inventory/inventory.types';
import ReferralTierModal from '../modals/ReferralTierModal';
import { toast } from 'sonner';

export default function ReferralTiersPageClient() {
  const { data: tiersResponse, isLoading } = useInventoryReferralTiers();
  const deleteMutation = useDeleteReferralTier();
  const tiers = Array.isArray(tiersResponse) ? tiersResponse : (tiersResponse as any)?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<ReferralTier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (tier: ReferralTier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTier(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tier?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // toast handled in mutation
      }
    }
  };

  const filteredTiers = tiers.filter((t: ReferralTier) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Topbar title="Referral Tiers" subtitle="Manage tiered rewards for top referrers." product="inventory" />

      <div style={{ padding: 'var(--content-padding)' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referral Tiers</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your referral tiers based on point thresholds.</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
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
              placeholder="Search referral tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <th style={{ textAlign: 'left' }}>Tier Name</th>
                <th style={{ textAlign: 'left' }}>Points Threshold</th>
                <th style={{ textAlign: 'left' }}>Order</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ width: 100, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td><div style={{ height: 20, width: '120px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 20, width: '60px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 20, width: '40px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 20, width: '80px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ height: 20, width: '40px', background: '#f5f5f5', borderRadius: 4, margin: '0 auto' }} className="animate-pulse-soft"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTiers.map((tier: ReferralTier) => (
                <tr key={tier.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ fontWeight: 600, color: '#1a1a2e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {tier.color && <div style={{ width: 12, height: 12, borderRadius: '50%', background: tier.color }}></div>}
                      {tier.name}
                    </div>
                  </td>
                  <td>{tier.min_points} points</td>
                  <td>{tier.order}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: tier.status === 'Active' ? '#eaf4e3' : '#fef2f2',
                      color: tier.status === 'Active' ? '#6c9e4e' : '#ef4444'
                    }}>
                      {tier.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleEdit(tier)}
                        style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tier.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReferralTierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={selectedTier}
      />
    </div>
  );
}
