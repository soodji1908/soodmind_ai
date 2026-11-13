import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const params = request.nextUrl.searchParams;
    const search = (params.get('q') || '').trim().slice(0, 100);
    const type = params.get('type');
    const filter: Record<string, any> = { deletedAt: null, status: { $in: ['for_sale', 'for_rent'] } };
    if (type === 'for_sale' || type === 'for_rent') filter.status = type;
    if (search) filter.$or = [
      { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { 'location.city': { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { 'location.address': { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
    ];
    const items = await Property.find(filter)
      .select('title description propertyType status price currency areaSqft bedrooms bathrooms location amenities createdAt')
      .sort({ createdAt: -1 }).limit(60).lean();
    return NextResponse.json({ ok: true, items, total: items.length });
  } catch (error) {
    console.error('[marketplace/properties]', error);
    return NextResponse.json({ message: 'Property listings are temporarily unavailable.' }, { status: 503 });
  }
}
