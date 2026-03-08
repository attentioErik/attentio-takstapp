import { NextRequest, NextResponse } from 'next/server';
import { db, buildingSections } from '@/lib/db';
import { eq } from 'drizzle-orm';
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

    // Delete existing sections
    await db.delete(buildingSections).where(eq(buildingSections.reportId, id));

    // Insert new sections
    if (sections && sections.length > 0) {
      const toInsert = sections.map((s, i) => ({
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
        images: s.images || null,
        sortOrder: i,
        isRequired: s.isRequired ?? false,
      }));
      const newSections = await db.insert(buildingSections).values(toInsert).returning();
      return NextResponse.json({ sections: newSections });
    }

    return NextResponse.json({ sections: [] });
  } catch (error) {
    console.error('PUT sections error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
