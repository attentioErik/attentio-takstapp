import { NextRequest, NextResponse } from 'next/server';
import { mockReports } from '@/lib/mock-data';
import { generateReportNumber } from '@/lib/utils';
import { ReportWithSections } from '@/types';

// In production, these would use Drizzle ORM
// import { db } from '@/lib/db';
// import { reports } from '@/lib/db/schema';

let reportsStore = [...mockReports];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  let filtered = reportsStore;

  if (status) {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (type) {
    filtered = filtered.filter((r) => r.type === type);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.propertyAddress.toLowerCase().includes(q) ||
        r.reportNumber.toLowerCase().includes(q) ||
        r.client?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ reports: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const newReport: ReportWithSections = {
    id: `report-${Date.now()}`,
    userId: 'user-1',
    reportNumber: generateReportNumber(),
    status: 'draft',
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...body,
  };

  reportsStore = [newReport, ...reportsStore];

  return NextResponse.json({ report: newReport }, { status: 201 });
}
