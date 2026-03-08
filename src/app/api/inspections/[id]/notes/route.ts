import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inspectionNotes } from '@/lib/db/schema';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [note] = await db.insert(inspectionNotes).values({
    inspectionId: id,
    userId: DEMO_USER_ID,
    sectionId: body.sectionId,
    noteType: body.noteType,
    content: body.content,
    audioUrl: body.audioUrl || null,
    duration: body.duration || null,
  }).returning();
  return NextResponse.json({ note });
}
