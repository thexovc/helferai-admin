import { NextRequest, NextResponse } from 'next/server';
import { BUSINESSES, FINANCE_TRANSACTIONS } from '../../../../lib/data';
import { Business } from '../../../../lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || '';

  let filteredBusinesses = [...BUSINESSES];

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredBusinesses = filteredBusinesses.filter(
      (b: Business) =>
        b.name.toLowerCase().includes(searchLower) ||
        b.email.toLowerCase().includes(searchLower) ||
        b.registrationNumber?.toLowerCase().includes(searchLower)
    );
  }

  // Advanced filters
  if (filter) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'active':
        filteredBusinesses = filteredBusinesses.filter((b) => b.status === 'Active');
        break;
      case 'trial':
        filteredBusinesses = filteredBusinesses.filter((b) => b.status === 'Trial');
        break;
      case 'expired':
        filteredBusinesses = filteredBusinesses.filter((b) => b.status === 'Expired' || b.daysRemaining < 0);
        break;
      case 'cancelled':
        filteredBusinesses = filteredBusinesses.filter((b) => b.status === 'Cancelled');
        break;
      case 'expiring_5d':
        filteredBusinesses = filteredBusinesses.filter(
          (b) => b.daysRemaining >= 0 && b.daysRemaining <= 5
        );
        break;
      case 'expiring_30d':
        filteredBusinesses = filteredBusinesses.filter(
          (b) => b.daysRemaining >= 0 && b.daysRemaining <= 30
        );
        break;
      case 'trial_ending_3d':
        filteredBusinesses = filteredBusinesses.filter(
          (b) => b.status === 'Trial' && b.daysRemaining >= 0 && b.daysRemaining <= 3
        );
        break;
      case 'failed_payments':
        // Find businesses that have at least one failed transaction
        const businessesWithFailedPayments = new Set(
          FINANCE_TRANSACTIONS.filter((t) => t.status === 'Failed').map((t) => t.businessOrUserName)
        );
        filteredBusinesses = filteredBusinesses.filter((b) => businessesWithFailedPayments.has(b.name));
        break;
      case 'high_paying':
        filteredBusinesses = filteredBusinesses.filter((b) => b.amountPaying > 50000);
        break;
      case 'annual_plan':
        filteredBusinesses = filteredBusinesses.filter((b) => b.billingCycle === 'Annual');
        break;
      case 'auto_renew_off':
        filteredBusinesses = filteredBusinesses.filter((b) => b.status === 'Active' && !b.autoRenew);
        break;
      case 'inactive_30d':
        filteredBusinesses = filteredBusinesses.filter((b) => {
          const lastLoginDate = new Date(b.lastLogin);
          return lastLoginDate < thirtyDaysAgo;
        });
        break;
    }
  }

  // Pagination
  const total = filteredBusinesses.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filteredBusinesses.slice(start, end);

  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
