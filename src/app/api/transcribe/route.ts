import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) return NextResponse.json({ error: 'Ingen lydfil' }, { status: 400 });

    const audioBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Strip codec params from mimeType (e.g. "audio/webm;codecs=opus" → "audio/webm")
    const mediaType = (audioFile.type || 'audio/webm').split(';')[0];

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Audio,
              },
            },
            {
              type: 'text',
              text: 'Transkriber dette lydopptaket til norsk tekst. Dette er notater fra en takstmann på befaring. Behold tekniske termer og beskrivelser nøyaktig. Returner kun transkripsjonen, ingen ekstra tekst.',
            },
          ],
        },
      ],
    });

    const transcription = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Transkriberingsfeil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
