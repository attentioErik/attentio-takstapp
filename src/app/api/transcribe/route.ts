import { NextRequest, NextResponse } from 'next/server';

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
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
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic API error:', err);
      throw new Error(err.error?.message || 'API-feil');
    }

    const data = await response.json();
    const transcription = data.content?.[0]?.type === 'text' ? data.content[0].text : '';
    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Transkriberingsfeil';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
