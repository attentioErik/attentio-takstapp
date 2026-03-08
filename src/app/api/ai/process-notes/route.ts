import { NextRequest, NextResponse } from 'next/server';
import { processNotes } from '@/lib/ai/process-notes';
import { z } from 'zod';

const schema = z.object({
  notes: z.string().min(10, 'Notater må ha minst 10 tegn'),
  reportType: z.string(),
  propertyType: z.string(),
  constructionYear: z.number().int().min(1800).max(2025),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);

    const sections = await processNotes(input);

    return NextResponse.json({ sections });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0]?.message || 'Valideringsfeil';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke behandle notater med AI. Sjekk API-nøkkel.' },
      { status: 500 }
    );
  }
}
