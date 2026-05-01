'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Gift, MoreVertical } from 'lucide-react';
import { useInventoryReferralRewards } from '@/api/inventory/inventory.queries';
import { ReferralReward } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';

export default function ReferralRewardsPageClient() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const { data: rewardsResponse, isLoading } = useInventoryReferralRewards(page, pageSize);
  const rewards = rewardsResponse?.data || [];
  const meta = rewardsResponse?.meta || { total: 0, page: 1, pageSize: 10 };
  const [search, setSearch] = React.useState('');

  const filteredRewards = rewards.filter((r: ReferralReward) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Topbar title="Referral Rewards" subtitle="View and audit rewards issued to users." product="inventory" />

      <div style={{ padding: 'var(--content-padding)' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gift size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referral Rewards</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Audit rewards issued and points consumed by users.</p>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              placeholder="Search rewards by user name..."
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
                <th style={{ textAlign: 'left' }}>User Name</th>
                <th style={{ textAlign: 'left' }}>Points Value</th>
                <th style={{ textAlign: 'left' }}>Reward Type</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ width: 60, textAlign: 'center' }}>Actions</th>
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
                    <td style={{ textAlign: 'center' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : filteredRewards.length === 0 ? (
                <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No rewards recorded yet</td>
                </tr>
              ) : filteredRewards.map((reward: ReferralReward) => (
                <tr key={reward.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{reward.name}</td>
                  <td style={{ color: '#6c9e4e', fontWeight: 700 }}>{reward.points} pts</td>
                  <td style={{ textTransform: 'capitalize' }}>{reward.type}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: '#eaf4e3',
                      color: '#6c9e4e'
                    }}>
                      {reward.status}
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

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(meta.total / pageSize)}
            onPageChange={setPage}
            totalItems={meta.total}
            pageSize={pageSize}
          />
        </div>

      </div>
    </div>
  );
}
