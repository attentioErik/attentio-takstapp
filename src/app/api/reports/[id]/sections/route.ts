import { NextRequest, NextResponse } from 'next/server';
import { mockSections } from '@/lib/mock-data';
import { BuildingSectionData } from '@/types';

let sectionsStore: BuildingSectionData[] = [...mockSections];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sections = sectionsStore.filter((s) => s.reportId === id);
  return NextResponse.json({ sections });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const newSection: BuildingSectionData = {
    id: `sec-${Date.now()}`,
    reportId: id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortOrder: sectionsStore.filter((s) => s.reportId === id).length,
    isRequired: false,
    ...body,
  };

  sectionsStore = [...sectionsStore, newSection];

  return NextResponse.json({ section: newSection }, { status: 201 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { sections } = body as { sections: BuildingSectionData[] };

  // Remove existing sections for this report
  sectionsStore = sectionsStore.filter((s) => s.reportId !== id);

  // Add new sections
  const newSections = sections.map((s, i) => ({
    ...s,
    reportId: id,
    sortOrder: i,
    updatedAt: new Date().toISOString(),
  }));

  sectionsStore = [...sectionsStore, ...newSections];

  return NextResponse.json({ sections: newSections });
}
