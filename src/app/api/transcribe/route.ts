import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) return NextResponse.json({ error: 'Ingen lydfil' }, { status: 400 });

    const audioBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Strip codec params from mimeType (e.g. "audio/webm;codecs=opus" → "audio/webm")
    const mimeType = (audioFile.type || 'audio/webm').split(';')[0];

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Audio,
        },
      },
      {
        text: `Transkriber dette lydopptaket til norsk tekst. Dette er notater fra en takstmann på befaring. Behold tekniske termer og beskrivelser nøyaktig. Returner kun transkripsjonen, ingen ekstra tekst.`,
      },
    ]);

    const transcription = result.response.text();
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Transkriberingsfeil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
