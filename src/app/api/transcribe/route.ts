import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) return NextResponse.json({ error: 'Ingen lydfil' }, { status: 400 });

    const audioBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: (audioFile.type || 'audio/webm') as string,
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
    return NextResponse.json({ error: 'Transkriberingsfeil' }, { status: 500 });
  }
}
