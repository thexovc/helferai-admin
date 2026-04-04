import { NextRequest, NextResponse } from 'next/server';
import { BUSINESSES } from '../../../../../lib/data';
import { Business } from '../../../../../lib/types';

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
    return NextResponse.json({ success: false, message: 'Business not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: business });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const body = await request.json();
  const index = BUSINESSES.findIndex((b: Business) => b.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Business not found' }, { status: 404 });
  }

  // Update in-memory data
  const updatedBusiness = { ...BUSINESSES[index], ...body };
  BUSINESSES[index] = updatedBusiness;

  return NextResponse.json({ success: true, data: updatedBusiness });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const index = BUSINESSES.findIndex((b: Business) => b.id === id);

  if (index === -1) {
    return NextResponse.json({ success: false, message: 'Business not found' }, { status: 404 });
  }

  // Remove from in-memory data
  const deletedBusiness = BUSINESSES.splice(index, 1)[0];

  return NextResponse.json({ success: true, data: deletedBusiness });
}
