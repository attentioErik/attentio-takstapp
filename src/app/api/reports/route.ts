import { NextRequest, NextResponse } from 'next/server';
import { db, reports, users, buildingSections } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { generateReportNumber } from '@/lib/utils';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

async function ensureDemoUser() {
  const existing = await db.select().from(users).where(eq(users.id, DEMO_USER_ID)).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({
      id: DEMO_USER_ID,
      email: 'demo@takstapp.no',
      name: 'Demo Bruker',
      company: 'Takstfirma AS',
      certifications: 'Statsautorisert takstmann',
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const allReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, DEMO_USER_ID))
      .orderBy(desc(reports.createdAt));

    let filtered = allReports;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (type) filtered = filtered.filter((r) => r.type === (type as typeof r.type));
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.propertyAddress.toLowerCase().includes(q) ||
          r.reportNumber.toLowerCase().includes(q) ||
          r.client?.toLowerCase().includes(q)
      );
    }

    const reportsWithSections = await Promise.all(
      filtered.map(async (report) => {
        const sections = await db
          .select()
          .from(buildingSections)
          .where(eq(buildingSections.reportId, report.id));
        return { ...report, sections };
      })
    );

    return NextResponse.json({ reports: reportsWithSections });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Kunne ikke hente rapporter' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDemoUser();
    const body = await req.json();

    const [newReport] = await db
      .insert(reports)
      .values({
        userId: DEMO_USER_ID,
        reportNumber: generateReportNumber(),
        type: body.type,
        status: body.status || 'draft',
        propertyAddress: body.propertyAddress,
        postalCode: body.postalCode || null,
        city: body.city || null,
        municipality: body.municipality || null,
        gnr: body.gnr || null,
        bnr: body.bnr || null,
        snr: body.snr || null,
        fnr: body.fnr || null,
        propertyType: body.propertyType || null,
        constructionYear: body.constructionYear || null,
        bra: body.bra || null,
        prom: body.prom || null,
        numberOfFloors: body.numberOfFloors || null,
        client: body.client || null,
        clientEmail: body.clientEmail || null,
        clientPhone: body.clientPhone || null,
        inspectionDate: body.inspectionDate ? new Date(body.inspectionDate) : null,
        rawNotes: body.rawNotes || null,
        summary: body.summary || null,
      })
      .returning();

    return NextResponse.json({ report: { ...newReport, sections: [] } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: 'Kunne ikke opprette rapport' }, { status: 500 });
  }
}
