import { NextRequest, NextResponse } from 'next/server';
import { db, buildingSections } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';
import { BuildingSectionData } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sections = await db
      .select()
      .from(buildingSections)
      .where(eq(buildingSections.reportId, id));
    return NextResponse.json({ sections });
  } catch (error) {
    console.error('GET sections error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sections } = body as { sections: BuildingSectionData[] };

    // Get existing section IDs for this report
    const existing = await db
      .select({ id: buildingSections.id })
      .from(buildingSections)
      .where(eq(buildingSections.reportId, id));
    const existingIds = new Set(existing.map((s) => s.id));

    // Delete sections that are no longer in the payload
    const incomingIds = new Set((sections || []).map((s) => s.id));
    const toDelete = [...existingIds].filter((eid) => !incomingIds.has(eid));
    if (toDelete.length > 0) {
      await db.delete(buildingSections).where(inArray(buildingSections.id, toDelete));
    }

    // Upsert each section — UPDATE if it exists, INSERT if new
    for (let i = 0; i < (sections || []).length; i++) {
      const s = sections[i];
      const data = {
        reportId: id,
        category: s.category,
        subcategory: s.subcategory || null,
        name: s.name,
        conditionGrade: s.conditionGrade || null,
        description: s.description || null,
        observations: s.observations || null,
        cause: s.cause || null,
        consequence: s.consequence || null,
        repairCost: s.repairCost || null,
        repairCostMin: s.repairCostMin || null,
        repairCostMax: s.repairCostMax || null,
        moistureMeasurements: s.moistureMeasurements || null,
        sortOrder: i,
        isRequired: s.isRequired ?? false,
        updatedAt: new Date(),
      };

      if (existingIds.has(s.id)) {
        await db.update(buildingSections).set(data).where(eq(buildingSections.id, s.id));
      } else {
        await db.insert(buildingSections).values(data);
      }
    }

    const updatedSections = await db
      .select()
      .from(buildingSections)
      .where(eq(buildingSections.reportId, id));

    return NextResponse.json({ sections: updatedSections });
  } catch (error) {
    console.error('PUT sections error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
