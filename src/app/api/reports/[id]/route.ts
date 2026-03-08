import { NextRequest, NextResponse } from 'next/server';
import { db, reports, buildingSections } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
    if (!report) {
      return NextResponse.json({ error: 'Rapport ikke funnet' }, { status: 404 });
    }
    const sections = await db
      .select()
      .from(buildingSections)
      .where(eq(buildingSections.reportId, id));
    return NextResponse.json({ report: { ...report, sections } });
  } catch (error) {
    console.error('GET /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await db
      .update(reports)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Rapport ikke funnet' }, { status: 404 });
    }

    return NextResponse.json({ report: updated });
  } catch (error) {
    console.error('PATCH /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(buildingSections).where(eq(buildingSections.reportId, id));
    await db.delete(reports).where(eq(reports.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
