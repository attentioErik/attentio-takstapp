import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inspections, inspectionNotes } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [inspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, DEMO_USER_ID)));
  if (!inspection) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });

  const notes = await db.select().from(inspectionNotes)
    .where(eq(inspectionNotes.inspectionId, id))
    .orderBy(asc(inspectionNotes.createdAt));

  return NextResponse.json({ inspection, notes });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [inspection] = await db.update(inspections)
    .set({ status: body.status, updatedAt: new Date() })
    .where(and(eq(inspections.id, id), eq(inspections.userId, DEMO_USER_ID)))
    .returning();
  return NextResponse.json({ inspection });
}
