import { NextRequest, NextResponse } from 'next/server';
import { mockReports } from '@/lib/mock-data';

let reportsStore = [...mockReports];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = reportsStore.find((r) => r.id === id);

  if (!report) {
    return NextResponse.json({ error: 'Rapport ikke funnet' }, { status: 404 });
  }

  return NextResponse.json({ report });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const index = reportsStore.findIndex((r) => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Rapport ikke funnet' }, { status: 404 });
  }

  reportsStore[index] = {
    ...reportsStore[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ report: reportsStore[index] });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = reportsStore.findIndex((r) => r.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Rapport ikke funnet' }, { status: 404 });
  }

  reportsStore.splice(index, 1);

  return NextResponse.json({ success: true });
}
