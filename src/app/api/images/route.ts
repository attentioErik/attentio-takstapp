import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reportImages, reports } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, sectionId, uploadcareUuid, cdnUrl, filename, caption } = body;

    if (!reportId || !sectionId || !uploadcareUuid || !cdnUrl) {
      return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 });
    }

    // Verify report belongs to user
    const [report] = await db.select().from(reports).where(
      and(eq(reports.id, reportId), eq(reports.userId, DEMO_USER_ID))
    ).limit(1);
    if (!report) return NextResponse.json({ error: 'Ikke tilgang' }, { status: 403 });

    const [image] = await db.insert(reportImages).values({
      userId: DEMO_USER_ID,
      reportId,
      sectionId,
      uploadcareUuid,
      cdnUrl,
      filename: filename || null,
      caption: caption || null,
    }).returning();

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('POST /api/images error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');
    const sectionId = searchParams.get('sectionId');

    if (!reportId) return NextResponse.json({ error: 'reportId påkrevd' }, { status: 400 });

    let imgs;
    if (sectionId) {
      imgs = await db.select().from(reportImages).where(
        and(
          eq(reportImages.reportId, reportId),
          eq(reportImages.userId, DEMO_USER_ID),
          eq(reportImages.sectionId, sectionId)
        )
      );
    } else {
      imgs = await db.select().from(reportImages).where(
        and(
          eq(reportImages.reportId, reportId),
          eq(reportImages.userId, DEMO_USER_ID)
        )
      );
    }

    return NextResponse.json({ images: imgs });
  } catch (error) {
    console.error('GET /api/images error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
