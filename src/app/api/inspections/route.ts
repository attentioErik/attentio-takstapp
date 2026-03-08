import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inspections } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function GET() {
  const rows = await db.select().from(inspections)
    .where(eq(inspections.userId, DEMO_USER_ID))
    .orderBy(desc(inspections.createdAt));
  return NextResponse.json({ inspections: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [inspection] = await db.insert(inspections).values({
    userId: DEMO_USER_ID,
    address: body.address,
    propertyType: body.propertyType || null,
    status: 'in_progress',
  }).returning();
  return NextResponse.json({ inspection });
}
