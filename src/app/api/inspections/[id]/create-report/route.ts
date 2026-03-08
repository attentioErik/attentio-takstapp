import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inspections, inspectionNotes, reports, buildingSections } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

const SECTION_NAMES: Record<string, string> = {
  generelt: 'Generelt',
  tak: 'Tak og takkonstruksjon',
  fasade: 'Fasade og yttervegger',
  vinduer: 'Vinduer og dører',
  bad: 'Våtrom',
  kjokken: 'Kjøkken',
  elektrisk: 'Elektrisk anlegg',
  vvs: 'VVS',
  annet: 'Annet',
};

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [inspection] = await db.select().from(inspections)
    .where(and(eq(inspections.id, id), eq(inspections.userId, DEMO_USER_ID)));
  if (!inspection) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });

  const notes = await db.select().from(inspectionNotes)
    .where(eq(inspectionNotes.inspectionId, id));

  // Generate report number
  const reportCount = await db.select().from(reports).where(eq(reports.userId, DEMO_USER_ID));
  const reportNumber = `TA-${new Date().getFullYear()}-${String(reportCount.length + 1).padStart(3, '0')}`;

  const [report] = await db.insert(reports).values({
    userId: DEMO_USER_ID,
    reportNumber,
    type: 'tilstandsrapport',
    status: 'in_progress',
    propertyAddress: inspection.address,
    propertyType: (inspection.propertyType as 'enebolig' | 'rekkehus' | 'leilighet' | 'fritidsbolig' | 'tomannsbolig' | null) ?? null,
    inspectionDate: inspection.inspectionDate,
    rawNotes: notes.map((n) => n.content).join('\n\n'),
  }).returning();

  // Create sections from notes grouped by sectionId
  const sectionIds = [...new Set(notes.map((n) => n.sectionId))];
  const ORDER = ['generelt', 'tak', 'fasade', 'vinduer', 'bad', 'kjokken', 'elektrisk', 'vvs', 'annet'];
  sectionIds.sort((a, b) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  for (let i = 0; i < sectionIds.length; i++) {
    const sid = sectionIds[i];
    const sectionNotes = notes.filter((n) => n.sectionId === sid);
    const content = sectionNotes.map((n) => n.content).join('\n\n');
    if (!content.trim()) continue;

    await db.insert(buildingSections).values({
      reportId: report.id,
      category: sid,
      name: SECTION_NAMES[sid] || sid,
      description: content,
      sortOrder: i,
      isRequired: false,
    });
  }

  // Mark inspection as completed
  await db.update(inspections).set({ status: 'completed', updatedAt: new Date() })
    .where(eq(inspections.id, id));

  return NextResponse.json({ reportId: report.id });
}
