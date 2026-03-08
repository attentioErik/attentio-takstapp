import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reportImages } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.delete(reportImages).where(
      and(eq(reportImages.id, id), eq(reportImages.userId, DEMO_USER_ID))
    ).returning();
    if (!deleted.length) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/images/[id] error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { caption } = await req.json();
    const [updated] = await db.update(reportImages)
      .set({ caption })
      .where(and(eq(reportImages.id, id), eq(reportImages.userId, DEMO_USER_ID)))
      .returning();
    if (!updated) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });
    return NextResponse.json({ image: updated });
  } catch (error) {
    console.error('PATCH /api/images/[id] error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
