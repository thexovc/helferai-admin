'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Search, Filter, UserPlus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInventoryReferralsList } from '@/api/inventory/inventory.queries';
import { ReferralAudit } from '@/api/inventory/inventory.types';
import { format } from 'date-fns';

export default function ReferralsPageClient() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 10;

  const { data: listResponse, isLoading } = useInventoryReferralsList({
    page,
    pageSize,
    search: searchTerm,
    status: statusFilter === 'All' ? '' : statusFilter,
  });

  const referrals = listResponse?.data || [];
  const meta = listResponse?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div>
      <Topbar title="Referrals" subtitle="View and audit individual user referrals and status." product="inventory" />

      <div style={{ padding: 'var(--content-padding)' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referrals</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Review and audit referral activities across the platform.</p>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              placeholder="Search by name, email or code..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
              padding: '0 16px', height: 44, display: 'flex', alignItems: 'center', gap: 8,
              color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="rewarded">Rewarded</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Referrer</th>
                <th style={{ textAlign: 'left' }}>Referred User</th>
                <th style={{ textAlign: 'left' }}>Date</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'left' }}>Points</th>
                <th style={{ width: 60, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td><div style={{ height: 32, width: '150px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 32, width: '150px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 20, width: '80px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 20, width: '70px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td><div style={{ height: 20, width: '50px', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                    <td style={{ textAlign: 'center' }}>
                      <MoreVertical size={16} color="#e5e7eb" />
                    </td>
                  </tr>
                ))
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                    No referrals found based on your filters.
                  </td>
                </tr>
              ) : referrals.map((ref: ReferralAudit) => (
                <tr key={ref.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{ref.referrerName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{ref.referrerEmail}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{ref.referredName}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{ref.referredEmail}</div>
                  </td>
                  <td style={{ fontSize: 13, color: '#1a1a2e' }}>
                    {format(new Date(ref.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: ref.status === 'rewarded' ? '#eaf4e3' : '#fff7ed',
                      color: ref.status === 'rewarded' ? '#6c9e4e' : '#f97316',
                      textTransform: 'capitalize'
                    }}>
                      {ref.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: ref.pointsAwarded > 0 ? '#6c9e4e' : '#6b7280' }}>
                    {ref.pointsAwarded > 0 ? `+${ref.pointsAwarded}` : '0'} pts
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

          {/* Pagination Footer */}
          {meta && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, meta.total)} of {meta.total} entries
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: page === 1 ? '#9ca3af' : '#1a1a2e', cursor: page === 1 ? 'default' : 'pointer' }}
                >
                  <ChevronLeft size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (meta.totalPages || 1)}
                  style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: page >= (meta.totalPages || 1) ? '#9ca3af' : '#1a1a2e', cursor: page >= (meta.totalPages || 1) ? 'default' : 'pointer' }}
                >
                  Next
                  <ChevronRight size={16} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
