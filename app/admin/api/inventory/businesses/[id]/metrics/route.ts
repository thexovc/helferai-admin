import { NextRequest, NextResponse } from 'next/server';
import { BUSINESSES } from '../../../../../../lib/data';
import { Business } from '../../../../../../lib/types';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const business = BUSINESSES.find((b: Business) => b.id === id);

  if (!business) {
    return NextResponse.json(
      { success: false, message: 'Business not found' },
      { status: 404 }
    );
  }

  const data = {
    salesRecords: business.totalSales,
    expenseRecords: business.totalExpenses,
    products: business.totalProducts,
    subEnds: business.subEndDate,
    daysRemaining: `${business.daysRemaining}d`,
    totalRevenue: business.totalRevenue,
    totalUsers: business.totalUsers,
    lastLogin: business.lastLogin,
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
